import { getSession } from "@/lib/auth-server";
import { getPool } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return Response.json([]);
  }

  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT category_id, nominee_id
     FROM votes
     WHERE user_id = $1`,
    [session.user.id]
  );

  return Response.json(rows);
}