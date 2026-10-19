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
  // Check current schema and apply migrations
  console.log("Checking current schema...");

  // Add missing columns to votes table
  const votesColumns = await client.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'votes'
  `);
  const colNames = new Set(votesColumns.rows.map(r => r.column_name));

  if (!colNames.has('user_id')) {
    await withRetry(() => client.query(`ALTER TABLE votes ADD COLUMN user_id text`));
    console.log("Added user_id column to votes");
  }
  if (!colNames.has('category_id')) {
    await withRetry(() => client.query(`ALTER TABLE votes ADD COLUMN category_id bigint`));
    console.log("Added category_id column to votes");
  }

  // Create user_roles table
  await withRetry(() => client.query(`
    CREATE TABLE IF NOT EXISTS user_roles (
      user_id text PRIMARY KEY,
      role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `));
  console.log("Created user_roles table");

  // Create admins table (dashboard access is granted by email)
  await withRetry(() => client.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      email text NOT NULL UNIQUE,
      fullname text NOT NULL DEFAULT ''
    )
  `));
  console.log("Created admins table");

  // Create system_logs table (admin action audit trail)
  await withRetry(() => client.query(`
    CREATE TABLE IF NOT EXISTS system_logs (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_email text NOT NULL,
      action text NOT NULL,
      details text NOT NULL DEFAULT '',
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `));
  await withRetry(() => client.query(`
    CREATE INDEX IF NOT EXISTS system_logs_created_at_idx ON system_logs (created_at DESC)
  `));
  console.log("Created system_logs table");

  // Add indexes
  await withRetry(() => client.query(`
    CREATE INDEX IF NOT EXISTS votes_user_id_idx ON votes (user_id)
  `));
  await withRetry(() => client.query(`
    CREATE INDEX IF NOT EXISTS votes_category_id_idx ON votes (category_id)
  `));

  // Add foreign key constraints (if not exists)
  try {
    await withRetry(() => client.query(`
      ALTER TABLE votes 
      ADD CONSTRAINT votes_category_id_fkey 
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
    `));
  } catch {
    // Constraint might already exist
  }

  // Add unique constraint for one vote per user per category
  try {
    await withRetry(() => client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS votes_user_category_unique 
      ON votes (user_id, category_id)
    `));
  } catch {
    // Index might already exist
  }

  // De-duplicate nominees. The seed used to run before the unique index existed,
  // so re-running it inserted the same name twice into a category.
  await withRetry(() => client.query(`
    UPDATE votes v
    SET nominee_id = keep.keep_id
    FROM (
      SELECT id, MIN(id) OVER (PARTITION BY category_id, name) AS keep_id
      FROM nominees
    ) keep
    WHERE v.nominee_id = keep.id
      AND keep.id <> keep.keep_id
      AND NOT EXISTS (
        SELECT 1 FROM votes x
        WHERE x.user_id = v.user_id
          AND x.category_id = v.category_id
          AND x.nominee_id = keep.keep_id
      )
  `));
  await withRetry(() => client.query(`
    DELETE FROM votes v
    USING (
      SELECT id, MIN(id) OVER (PARTITION BY category_id, name) AS keep_id
      FROM nominees
    ) keep
    WHERE v.nominee_id = keep.id AND keep.id <> keep.keep_id
  `));
  const deduped = await withRetry(() => client.query(`
    DELETE FROM nominees n
    USING (
      SELECT MIN(id) AS keep_id, category_id, name
      FROM nominees
      GROUP BY category_id, name
    ) keep
    WHERE n.category_id = keep.category_id
      AND n.name = keep.name
      AND n.id <> keep.keep_id
  `));
  if (deduped.rowCount > 0) {
    console.log(`Removed ${deduped.rowCount} duplicate nominees`);
  }

  // A name may only appear once per category (makes seeding idempotent)
  await withRetry(() => client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS nominees_category_name_unique
    ON nominees (category_id, name)
  `));

  // Apply seed data for categories (idempotent)
  const seedSql = readFileSync("db/seed.sql", "utf8");
  await withRetry(() => client.query(seedSql));
  console.log("Applied seed data");

  const counts = await client.query(`
    SELECT 
      (SELECT COUNT(*) FROM categories) as categories,
      (SELECT COUNT(*) FROM nominees) as nominees,
      (SELECT COUNT(*) FROM votes) as votes,
      (SELECT COUNT(*) FROM admins) as admins,
      (SELECT COUNT(*) FROM system_logs) as system_logs
  `);
  console.log("Counts:", JSON.stringify(counts.rows[0]));

} finally {
  await client.end();
}