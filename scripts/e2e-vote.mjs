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
const mode = process.argv[2];
if (mode !== "up" && mode !== "down") {
  console.error("usage: node scripts/e2e-vote.mjs <up|down>");
  process.exit(1);
}

const client = new pg.Client({ connectionString: env.DATABASE_URL_UNPOOLED });
await client.connect();
try {
  if (mode === "up") {
    const { rows } = await client.query(
      `with cat as (select id from categories where slug = 'class-clown')
       insert into nominees (category_id, name, blurb, sort_order)
       select id, 'E2E Test Nominee', 'Temporary row created by scripts/e2e-vote.mjs', 99
       from cat returning id, category_id`
    );
    const nomineeId = rows[0].id;
    await client.query("insert into votes (nominee_id) values ($1)", [nomineeId]);
    console.log("inserted nominee", nomineeId, "and 1 vote");
  } else {
    await client.query(
      "delete from nominees where name = 'E2E Test Nominee'"
    );
    console.log("removed test nominee and its votes");
  }
} finally {
  await client.end();
}
