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
const url = env.DATABASE_URL_UNPOOLED;
if (!url) {
  console.error("DATABASE_URL_UNPOOLED missing (run: npx neon env pull)");
  process.exit(1);
}

async function withRetry(fn, attempts = 5) {
  let err;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      err = e;
      const code = e?.cause?.code ?? e?.code ?? "";
      if (!/ECONN|ETIMEOUT|ENOTFOUND|EAI_AGAIN|RESET|_SOCKET/i.test(String(code))) throw e;
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw err;
}

const client = new pg.Client({ connectionString: url, ssl: "require" });
await withRetry(() => client.connect());
try {
  for (const file of ["db/schema.sql", "db/seed.sql"]) {
    const sql = readFileSync(file, "utf8");
    await withRetry(() => client.query(sql));
    console.log("applied", file);
  }
  const counts = await client.query(
    "select (select count(*) from categories) as categories, (select count(*) from nominees) as nominees, (select count(*) from votes) as votes"
  );
  console.log("counts:", JSON.stringify(counts.rows[0]));
} finally {
  await client.end();
}
