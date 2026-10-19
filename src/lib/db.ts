import pg from "pg";

const globalForDb = globalThis as unknown as { dbPool?: pg.Pool };

export function getPool(): pg.Pool {
  if (!globalForDb.dbPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not set. Run `npx neon env pull` to fetch it into .env.local."
      );
    }
    globalForDb.dbPool = new pg.Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30_000,
    });
  }
  return globalForDb.dbPool;
}

export type Category = {
  id: string;
  slug: string;
  title: string;
  blurb: string;
  sort_order: number;
};

export type Nominee = {
  id: string;
  category_id: string;
  name: string;
  blurb: string;
  sort_order: number;
  votes: number;
};

export async function getCategories(): Promise<Category[]> {
  const { rows } = await getPool().query<Category>(
    "select id, slug, title, blurb, sort_order from categories order by sort_order, id"
  );
  return rows;
}

export async function getNominees(): Promise<Nominee[]> {
  const { rows } = await getPool().query<Nominee>(
    `select n.id, n.category_id, n.name, n.blurb, n.sort_order,
            count(v.id)::int as votes
     from nominees n
     left join votes v on v.nominee_id = n.id
     group by n.id
     order by n.sort_order, n.id`
  );
  return rows;
}
