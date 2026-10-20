import { getPool } from "@/lib/db";
import { getVotingOpen } from "@/lib/voting";
import { BarChart } from "./_components/bar-chart";
import { PrintWinnerButton } from "./_components/print-winner";
import { SectionHeader } from "./_components/ui";

export default async function AdminOverviewPage() {
  const pool = getPool();
  const votingOpen = await getVotingOpen();

  const { rows: stats } = await pool.query<{
    votes: number;
    voters: number;
    categories: number;
    nominees: number;
  }>(`
    SELECT
      (SELECT COUNT(*)::int FROM votes) as votes,
      (SELECT COUNT(DISTINCT user_id)::int FROM votes) as voters,
      (SELECT COUNT(*)::int FROM categories) as categories,
      (SELECT COUNT(*)::int FROM nominees) as nominees
  `);

  const { rows: totals } = await pool.query<{
    category_id: string;
    title: string;
    nominees: { id: string; name: string; votes: number }[] | null;
  }>(`
    SELECT
      c.id as category_id,
      c.title,
      json_agg(
        json_build_object(
          'id', n.id,
          'name', n.name,
          'votes', COALESCE(v.cnt, 0)
        ) ORDER BY n.sort_order
      ) FILTER (WHERE n.id IS NOT NULL) AS nominees
    FROM categories c
    LEFT JOIN nominees n ON n.category_id = c.id
    LEFT JOIN (
      SELECT nominee_id, COUNT(*) as cnt FROM votes GROUP BY nominee_id
    ) v ON v.nominee_id = n.id
    GROUP BY c.id
    ORDER BY c.sort_order, c.id
  `);

  const { rows: votes } = await pool.query<{
    vote_id: string;
    voter_email: string;
    category_title: string;
    nominee_name: string;
    voted_at: string;
  }>(`
    SELECT
      v.id as vote_id,
      u.email as voter_email,
      c.title as category_title,
      n.name as nominee_name,
      v.created_at as voted_at
    FROM votes v
    JOIN users u ON u.id = v.user_id
    JOIN nominees n ON n.id = v.nominee_id
    JOIN categories c ON c.id = n.category_id
    ORDER BY v.created_at DESC
    LIMIT 200
  `);

  const summary = stats[0];

  return (
    <>
      <SectionHeader
        eyebrow="/ Admin / Overview"
        title="Vote Counts"
        description="Live tally of every category, nominee and ballot cast."
      />

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Votes" value={summary.votes} />
        <StatCard label="Voters" value={summary.voters} />
        <StatCard label="Categories" value={summary.categories} />
        <StatCard label="Nominees" value={summary.nominees} />
      </div>

      <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-admin-muted">
        Charts by Category
      </h2>
      <div className="mb-12 grid gap-4 md:grid-cols-2">
        {totals.map((category) => {
          const votes = category.nominees ?? [];
          const max = votes.reduce((m, n) => Math.max(m, n.votes), 0);
          const winners = max > 0 ? votes.filter((n) => n.votes === max) : [];
          const winner = winners[0];
          const isTie = winners.length > 1;

          return (
            <div key={category.category_id} className="border border-admin-border bg-admin-panel p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black uppercase leading-tight tracking-tight text-admin-fg">
                    {category.title}
                  </h3>
                  {winner && (
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-admin-accent">
                      {isTie ? "Tie" : "Winner"} · {winner.name}
                    </p>
                  )}
                </div>
                <PrintWinnerButton
                  categoryTitle={category.title}
                  categoryId={category.category_id}
                  nomineeId={winner?.id ?? ""}
                  winnerName={winner?.name ?? ""}
                  votingOpen={votingOpen}
                  isTie={isTie}
                  disabled={!winner}
                />
              </div>
              <BarChart
                data={votes.map((nominee) => ({
                  id: nominee.id,
                  label: nominee.name,
                  votes: nominee.votes,
                }))}
              />
            </div>
          );
        })}
      </div>

      <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-admin-muted">
        Recent Votes
      </h2>
      <div className="overflow-x-auto border border-admin-border bg-admin-panel">
        <table className="w-full">
          <thead>
            <tr className="border-b border-admin-border bg-admin-panel">
              {["Voter", "Category", "Nominee", "Voted At"].map((heading) => (
                <th
                  key={heading}
                  className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-admin-muted"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {votes.map((vote) => (
              <tr key={vote.vote_id} className="border-b border-admin-border/60 last:border-0">
                <td className="max-w-[220px] truncate px-4 py-3 font-mono text-xs text-admin-fg/70">
                  {vote.voter_email}
                </td>
                <td className="px-4 py-3 text-sm font-bold uppercase tracking-tight text-admin-fg">
                  {vote.category_title}
                </td>
                <td className="px-4 py-3 text-sm text-admin-fg">{vote.nominee_name}</td>
                <td className="px-4 py-3 font-mono text-xs text-admin-muted">
                  {new Date(vote.voted_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {votes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-admin-muted">
                  No votes cast yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-admin-border bg-admin-panel p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-admin-muted">{label}</p>
      <p className="mt-2 text-4xl font-black text-admin-fg">{value}</p>
    </div>
  );
}
