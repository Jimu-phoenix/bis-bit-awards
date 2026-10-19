// Run this on the host where the dev server + network reach Neon:
//   node scripts/diagnose-auth.mjs
// It signs up + signs in via the app API and reports exactly what cookies come
// back and whether /api/session recognizes the session.

const BASE = process.env.E2E_BASE || "http://localhost:3000";
const rand = Math.random().toString(36).slice(2, 7);
const email = `bis21-diag${rand}@mubas.ac.mw`;
const password = "DiagPass123!";

function jarFrom(setCookies, jar = new Map()) {
  for (const c of setCookies) {
    const [pair] = c.split(";");
    const eq = pair.indexOf("=");
    const name = pair.slice(0, eq);
    const value = pair.slice(eq + 1);
    if (!value || /max-age=0/i.test(c)) jar.delete(name);
    else jar.set(name, value);
  }
  return jar;
}
const cookieHeader = (jar) => [...jar.entries()].map(([n, v]) => `${n}=${v}`).join("; ");

async function main() {
  console.log("BASE:", BASE, "\n");

  const su = await fetch(`${BASE}/api/auth/sign-up`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name: email.split("@")[0] }),
  });
  console.log("sign-up:", su.status, "set-cookie:", su.headers.getSetCookie());
  console.log("sign-up body:", (await su.text()).slice(0, 300), "\n");

  let jar = jarFrom(su.headers.getSetCookie());

  // If sign-up didn't establish a session, sign in.
  if (jar.size === 0) {
    const si = await fetch(`${BASE}/api/auth/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    console.log("sign-in:", si.status, "set-cookie:", si.headers.getSetCookie());
    console.log("sign-in body:", (await si.text()).slice(0, 300), "\n");
    jar = jarFrom(si.headers.getSetCookie(), jar);
  }

  console.log("cookie jar names:", [...jar.keys()], "\n");

  const sess = await fetch(`${BASE}/api/session`, { headers: { Cookie: cookieHeader(jar) } });
  console.log("/api/session status:", sess.status);
  console.log("/api/session body:", await sess.text(), "\n");

  const vote = await fetch(`${BASE}/vote`, { headers: { Cookie: cookieHeader(jar) }, redirect: "manual" });
  console.log("/vote status:", vote.status, "location:", vote.headers.get("location"));
}

main().catch((e) => {
  console.error("diag crashed:", e);
  process.exit(1);
});
