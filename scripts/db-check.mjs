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
const url = process.env.USE_UNPOOLED ? env.DATABASE_URL_UNPOOLED : env.DATABASE_URL;

const client = new pg.Client({ connectionString: url, ssl: "require" });
await client.connect();
try {
  const ping = await client.query("select 1 as ok");
  const info = await client.query(
    "select current_database() as db, current_user as usr, version() as ver"
  );
  const tables = await client.query(
    `select table_name from information_schema.tables
     where table_schema = 'public' order by table_name`
  );
  console.log("select1:", ping.rows[0].ok);
  console.log("database:", info.rows[0].db, "| user:", info.rows[0].usr);
  console.log("tables:", tables.rows.map((r) => r.table_name).join(", ") || "(none)");
} finally {
  await client.end();
}
