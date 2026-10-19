import { getPool } from "@/lib/db";

export async function getVotingOpen(): Promise<boolean> {
  const pool = getPool();
  const { rows } = await pool.query<{ voting_open: boolean }>(
    "select voting_open from voting_settings where id = 1"
  );

  if (rows.length > 0) {
    return rows[0].voting_open;
  }

  await pool.query(
    "insert into voting_settings (id, voting_open) values (1, true) on conflict (id) do nothing"
  );
  return true;
}

export async function setVotingOpen(open: boolean, updatedBy: string): Promise<void> {
  await getPool().query(
    `insert into voting_settings (id, voting_open, updated_at, updated_by)
     values (1, $1, now(), $2)
     on conflict (id) do update
     set voting_open = excluded.voting_open,
         updated_at = now(),
         updated_by = excluded.updated_by`,
    [open, updatedBy]
  );
}
