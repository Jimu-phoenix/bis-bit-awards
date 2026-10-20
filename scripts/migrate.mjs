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

  // --- Custom auth: users + sessions (replaces Neon Auth) ---------------------
  await withRetry(() => client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      email text NOT NULL UNIQUE,
      fullname text NOT NULL DEFAULT '',
      password_hash text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `));
  await withRetry(() => client.query(`
    CREATE INDEX IF NOT EXISTS users_email_lower_idx ON users (lower(email))
  `));
  console.log("Created users table");

  await withRetry(() => client.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id text PRIMARY KEY,
      user_id bigint NOT NULL REFERENCES users (id) ON DELETE CASCADE,
      created_at timestamptz NOT NULL DEFAULT now(),
      expires_at timestamptz NOT NULL
    )
  `));
  await withRetry(() => client.query(`
    CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions (user_id)
  `));
  await withRetry(() => client.query(`
    CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions (expires_at)
  `));
  console.log("Created sessions table");

  // votes.user_id used to be a text id pointing at neon_auth.user. It is now a
  // bigint referencing users. Since Neon Auth is being removed, clear ballots
  // and convert the column type if it is still text.
  const votesColumns = await client.query(`
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_name = 'votes'
  `);
  const colTypes = new Map(votesColumns.rows.map((r) => [r.column_name, r.data_type]));

  if (colTypes.get("user_id") === "text") {
    await withRetry(() => client.query(`DELETE FROM votes`));
    await withRetry(() => client.query(`ALTER TABLE votes DROP COLUMN user_id`));
    await withRetry(() => client.query(`ALTER TABLE votes ADD COLUMN user_id bigint`));
    console.log("Converted votes.user_id from text to bigint (cleared ballots)");
  }
  if (!colTypes.has("category_id")) {
    await withRetry(() => client.query(`ALTER TABLE votes ADD COLUMN category_id bigint`));
    console.log("Added category_id column to votes");
  }

  // Retire the unused user_roles table and the Neon Auth schema.
  await withRetry(() => client.query(`DROP TABLE IF EXISTS user_roles`));
  await withRetry(() => client.query(`DROP SCHEMA IF EXISTS neon_auth CASCADE`));
  console.log("Dropped user_roles and neon_auth schema");

  // Create admins table (dashboard access is granted by email)
  await withRetry(() => client.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      email text NOT NULL UNIQUE,
      fullname text NOT NULL DEFAULT ''
    )
  `));
  console.log("Created admins table");

  // Issued award certificates (unique verification code per winning nominee)
  await withRetry(() => client.query(`
    CREATE TABLE IF NOT EXISTS certificates (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      code text NOT NULL UNIQUE,
      nominee_id bigint NOT NULL REFERENCES nominees (id) ON DELETE CASCADE,
      category_id bigint NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
      nominee_name text NOT NULL,
      category_title text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      created_by text NOT NULL DEFAULT ''
    )
  `));
  await withRetry(() => client.query(`
    CREATE INDEX IF NOT EXISTS certificates_code_idx ON certificates (code)
  `));
  await withRetry(() => client.query(`
    CREATE INDEX IF NOT EXISTS certificates_nominee_id_idx ON certificates (nominee_id)
  `));
  await withRetry(() => client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS certificates_nominee_category_unique
    ON certificates (nominee_id, category_id)
  `));
  console.log("Created certificates table");

  // Add seed column to nominees table
  await withRetry(() => client.query(`
    ALTER TABLE nominees ADD COLUMN IF NOT EXISTS seed int NOT NULL DEFAULT 0
  `));
  console.log("Added seed column to nominees table");

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

  // Single-row toggle for the public voting period (on by default)
  await withRetry(() => client.query(`
    CREATE TABLE IF NOT EXISTS voting_settings (
      id smallint PRIMARY KEY CHECK (id = 1),
      voting_open boolean NOT NULL DEFAULT true,
      updated_at timestamptz NOT NULL DEFAULT now(),
      updated_by text NOT NULL DEFAULT ''
    )
  `));
  await withRetry(() => client.query(`
    INSERT INTO voting_settings (id, voting_open) VALUES (1, true)
    ON CONFLICT (id) DO NOTHING
  `));
  console.log("Created voting_settings table");

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

  // votes.user_id references users (id)
  try {
    await withRetry(() => client.query(`
      ALTER TABLE votes
      ADD CONSTRAINT votes_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
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
      (SELECT COUNT(*) FROM system_logs) as system_logs,
      (SELECT COUNT(*) FROM certificates) as certificates,
      (SELECT voting_open FROM voting_settings) as voting_open
  `);
  console.log("Counts:", JSON.stringify(counts.rows[0]));

} finally {
  await client.end();
}