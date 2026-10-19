import { readFileSync } from "node:fs";
import pg from "pg";

function loadEnv(file) {
  const env = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = { ...loadEnv(".env.local"), ...process.env };
const BASE = process.env.E2E_BASE || "http://172.30.96.1:3001";
const randLetters = Array.from({ length: 5 }, () =>
  "abcdefghijkmnpqrstuvwxyz".charAt(Math.floor(Math.random() * 24))
).join("");
const email = `bis21-test${randLetters}@mubas.ac.mw`;
const password = "E2eTestPass123!";

let passed = 0;
let failed = 0;
function check(name, cond, detail = "") {
  if (cond) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function cookieHeader(jar) {
  return [...jar.entries()]
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

function mergeCookies(jar, setCookies) {
  const map = new Map(jar);
  for (const c of setCookies) {
    const [pair] = c.split(";");
    const eq = pair.indexOf("=");
    const name = pair.slice(0, eq);
    const value = pair.slice(eq + 1);
    if (value === "" || /expires=Thu, 01 Jan 1970/i.test(c) || /max-age=0/i.test(c)) {
      map.delete(name);
    } else {
      map.set(name, value);
    }
  }
  return map;
}

const pool = new pg.Pool({ connectionString: env.DATABASE_URL });

async function main() {
  console.log(`E2E against ${BASE}`);
  console.log(`test user: ${email}\n`);

  // Remove any strays left by crashed runs
  await pool.query(`DELETE FROM votes WHERE user_id IN (SELECT id::text FROM neon_auth.user WHERE email LIKE 'bis21-test%@mubas.ac.mw' OR email LIKE 'bit22-test%@mubas.ac.mw')`);
  await pool.query(`DELETE FROM admins WHERE email LIKE 'bis21-test%@mubas.ac.mw' OR email LIKE 'bit22-test%@mubas.ac.mw'`);
  await pool.query(`DELETE FROM neon_auth.user WHERE email LIKE 'bis21-test%@mubas.ac.mw' OR email LIKE 'bit22-test%@mubas.ac.mw'`);

  // 1. Sign-up with an invalid (non-MUBAS) email must be rejected
  {
    const res = await fetch(`${BASE}/api/auth/sign-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "someone@gmail.com", password }),
    });
    check("sign-up rejects non-MUBAS email (400)", res.status === 400, `got ${res.status}`);
  }

  // 1b. Class-year boundaries: only 21 and 22 are allowed
  for (const bad of ["bis20-jdoe@mubas.ac.mw", "bit23-asmith@mubas.ac.mw", "bis2x-jdoe@mubas.ac.mw"]) {
    const res = await fetch(`${BASE}/api/auth/sign-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: bad, password }),
    });
    check(`sign-up rejects ${bad} (400)`, res.status === 400, `got ${res.status}`);
  }

  // 1c. Variable-length name part is allowed (bit22-... with a longer name)
  {
    const res = await fetch(`${BASE}/api/auth/sign-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: `bit22-test${randLetters}longname@mubas.ac.mw`, password }),
    });
    check("sign-up accepts bit22-<long name> (200)", res.status === 200, `got ${res.status}`);
  }

  // 2. Sign-up with a valid MUBAS email
  let jar = new Map();
  {
    let body = { email, password };
    let res = await fetch(`${BASE}/api/auth/sign-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.status >= 400) {
      // Neon Auth may require a name field
      body = { ...body, name: "E2E Tester" };
      res = await fetch(`${BASE}/api/auth/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    const text = await res.text();
    check("sign-up accepts valid MUBAS email (200)", res.status === 200, `got ${res.status}: ${text.slice(0, 200)}`);
    jar = mergeCookies(jar, res.headers.getSetCookie());
    check(
      "sign-up sets neon-auth session cookie",
      [...jar.keys()].some((k) => k.includes("neon-auth")),
      `cookies: ${[...jar.keys()].join(", ")}`
    );
  }

  const auth = { Cookie: cookieHeader(jar) };

  // 3. get-session returns the user
  {
    const res = await fetch(`${BASE}/api/auth/get-session`, { headers: auth });
    const data = await res.json();
    check("get-session returns user", data?.user?.email === email, JSON.stringify(data).slice(0, 200));
  }

  // 4. Middleware: /vote and /admin redirect when logged out, allow when logged in
  {
    const anon = await fetch(`${BASE}/vote`, { redirect: "manual" });
    check("middleware redirects anonymous /vote (307)", anon.status === 307, `got ${anon.status}`);
    const anonAdmin = await fetch(`${BASE}/admin`, { redirect: "manual" });
    check("middleware redirects anonymous /admin (307)", anonAdmin.status === 307, `got ${anonAdmin.status}`);
    const authed = await fetch(`${BASE}/vote`, { headers: auth, redirect: "manual" });
    check("middleware allows logged-in /vote (200)", authed.status === 200, `got ${authed.status}`);
  }

  // 5. Vote API: anonymous is rejected
  {
    const res = await fetch(`${BASE}/api/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomineeId: "x", categoryId: "x" }),
    });
    check("POST /api/vote unauthenticated -> 401", res.status === 401, `got ${res.status}`);
  }

  // Pick nominees from the DB
  const { rows: cats } = await pool.query(
    `SELECT c.id, c.slug,
       (SELECT array_agg(n.id ORDER BY n.id) FROM nominees n WHERE n.category_id = c.id) AS nominee_ids
     FROM categories c
     ORDER BY c.sort_order
     LIMIT 2`
  );
  check("have 2 categories with nominees", cats.length === 2 && cats.every((c) => (c.nominee_ids || []).length >= 1));

  const catA = cats[0];
  const catB = cats[1];
  const nomA1 = catA.nominee_ids[0];
  const nomA2 = catA.nominee_ids[1] ?? catA.nominee_ids[0];
  const nomB1 = catB.nominee_ids[0];

  // 6. Cast a vote, then change it (same category) -> still one vote row
  {
    const r1 = await fetch(`${BASE}/api/vote`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ nomineeId: nomA1, categoryId: catA.id }),
    });
    const t1 = await r1.text();
    check("first vote accepted (200)", r1.status === 200, `got ${r1.status}: ${t1.slice(0, 200)}`);

    const r2 = await fetch(`${BASE}/api/vote`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ nomineeId: nomA2, categoryId: catA.id }),
    });
    check("vote change in same category accepted (200)", r2.status === 200, `got ${r2.status}`);

    // Vote in a second category
    const r3 = await fetch(`${BASE}/api/vote`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ nomineeId: nomB1, categoryId: catB.id }),
    });
    check("vote in second category accepted (200)", r3.status === 200, `got ${r3.status}`);
  }

  // 7. DB: exactly one vote per category for this user, latest nominee kept
  {
    const { rows } = await pool.query(
      `SELECT category_id, nominee_id FROM votes WHERE user_id = (SELECT id::text FROM neon_auth.user WHERE email = $1) ORDER BY category_id`,
      [email]
    );
    check("user has exactly 2 vote rows (one per category)", rows.length === 2, `got ${rows.length}`);
    check("category A vote was updated to latest nominee", rows.some((r) => r.category_id === catA.id && r.nominee_id === nomA2));
  }

  // 8. /api/vote/user returns the user's votes
  {
    const res = await fetch(`${BASE}/api/vote/user`, { headers: auth });
    const data = await res.json();
    check("/api/vote/user returns 2 votes", Array.isArray(data) && data.length === 2, JSON.stringify(data));
    const anon = await fetch(`${BASE}/api/vote/user`);
    const anonData = await anon.json();
    check("/api/vote/user anonymous -> []", Array.isArray(anonData) && anonData.length === 0);
  }

  // 9. /api/vote/totals works anonymously and includes counts
  {
    const res = await fetch(`${BASE}/api/vote/totals`);
    const data = await res.json();
    const totalVotes = (data || []).reduce((s, c) => s + c.nominees.reduce((t, n) => t + n.votes, 0), 0);
    check("/api/vote/totals returns categories with counts", res.status === 200 && Array.isArray(data) && totalVotes >= 2, `status ${res.status}, votes ${totalVotes}`);
  }

  // 10. Admin gate: non-admin gets redirected to /vote
  {
    const res = await fetch(`${BASE}/admin`, { headers: auth, redirect: "manual" });
    check("non-admin /admin -> redirect (307)", res.status === 307, `got ${res.status}`);
    const loc = res.headers.get("location") || "";
    check("non-admin redirected to /vote", loc.includes("/vote"), loc);
  }

  // 11. Add the email to the admins table -> /admin renders
  const userId = (await pool.query(`SELECT id FROM neon_auth.user WHERE email = $1`, [email])).rows[0]?.id;
  {
    await pool.query(`INSERT INTO admins (email, fullname) VALUES ($1, $2)`, [email, "E2E Admin"]);
    const res = await fetch(`${BASE}/admin`, { headers: auth, redirect: "manual" });
    const body = await res.text();
    check("admin /admin renders (200)", res.status === 200 && body.includes("Admin Dashboard"), `got ${res.status}`);
  }

  // 12. Sign out clears the session
  {
    const res = await fetch(`${BASE}/api/auth/sign-out`, {
      method: "POST",
      headers: auth,
    });
    check("sign-out returns 200", res.status === 200, `got ${res.status}`);
    jar = mergeCookies(jar, res.headers.getSetCookie());

    const after = await fetch(`${BASE}/api/auth/get-session`, {
      headers: { Cookie: cookieHeader(jar) },
    });
    const data = await after.json();
    check("session gone after sign-out", !data?.user, JSON.stringify(data).slice(0, 200));

    // Reuse the ORIGINAL (now revoked) cookies — middleware must reject them
    const voteRes = await fetch(`${BASE}/vote`, { headers: auth, redirect: "manual" });
    check("middleware rejects revoked session (307)", voteRes.status === 307, `got ${voteRes.status}`);
  }

  // Cleanup test data
  try {
    await pool.query(`DELETE FROM votes WHERE user_id = $1`, [userId]);
    await pool.query(`DELETE FROM admins WHERE lower(email) = lower($1)`, [email]);
    await pool.query(`DELETE FROM admins WHERE email LIKE 'bit22-test%@mubas.ac.mw'`);
    await pool.query(`DELETE FROM votes WHERE user_id IN (SELECT id::text FROM neon_auth.user WHERE email LIKE 'bit22-test%@mubas.ac.mw')`);
    await pool.query(`DELETE FROM neon_auth.user WHERE email LIKE 'bit22-test%@mubas.ac.mw'`);
    await pool.query(`DELETE FROM neon_auth.user WHERE id = $1`, [userId]);
    console.log("\ncleanup: removed test votes, admin row, and user");
  } catch (e) {
    console.log(`\ncleanup warning: ${e.message}`);
  }
  await pool.end();

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch(async (e) => {
  console.error("E2E crashed:", e);
  try {
    await pool.end();
  } catch {}
  process.exit(1);
});
