import { getSession } from "@/lib/auth-server";
import { getPool } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { nomineeId, categoryId } = await req.json();
  if (!nomineeId || !categoryId) {
    return new Response("Missing nomineeId or categoryId", { status: 400 });
  }

  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verify nominee belongs to category
    const nomineeCheck = await client.query(
      "SELECT id FROM nominees WHERE id = $1 AND category_id = $2",
      [nomineeId, categoryId]
    );
    if (nomineeCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return new Response("Invalid nominee for category", { status: 400 });
    }

    // Upsert: one vote per user per category
    await client.query(
      `INSERT INTO votes (nominee_id, category_id, user_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, category_id) DO UPDATE
       SET nominee_id = EXCLUDED.nominee_id, created_at = now()`,
      [nomineeId, categoryId, session.user.id]
    );

    await client.query("COMMIT");

    // Return updated vote counts for this category
    const totals = await client.query(
      `SELECT n.id, n.name, COUNT(v.id)::int as votes
       FROM nominees n
       LEFT JOIN votes v ON v.nominee_id = n.id
       WHERE n.category_id = $1
       GROUP BY n.id
       ORDER BY n.sort_order, n.id`,
      [categoryId]
    );

    return Response.json({ ok: true, totals: totals.rows });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Vote error:", error);
    return new Response("Internal server error", { status: 500 });
  } finally {
    client.release();
  }
}