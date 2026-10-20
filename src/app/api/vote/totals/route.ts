import { getPool } from "@/lib/db";

export async function GET() {
  const pool = getPool();
  const { rows } = await pool.query(`
    SELECT c.id as category_id, c.slug, c.title,
           json_agg(
             json_build_object(
               'id', n.id,
               'name', n.name,
               'blurb', n.blurb,
               'votes', COALESCE(v.cnt, 0),
               'seed', COALESCE(n.seed, 0)
             ) ORDER BY n.sort_order, n.id
           ) FILTER (WHERE n.id IS NOT NULL) AS nominees
    FROM categories c
    LEFT JOIN nominees n ON n.category_id = c.id
    LEFT JOIN (
      SELECT nominee_id, COUNT(*) as cnt
      FROM votes
      GROUP BY nominee_id
    ) v ON v.nominee_id = n.id
    GROUP BY c.id
    ORDER BY c.sort_order, c.id
  `);
  return Response.json(rows);
}