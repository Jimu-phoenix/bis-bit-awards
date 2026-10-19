const BAR_LEVELS = [
  "bg-emerald-300/15",
  "bg-emerald-300/30",
  "bg-emerald-300/50",
  "bg-emerald-300/70",
  "bg-emerald-300",
];

export type BarChartDatum = { id: string; label: string; votes: number };

export function BarChart({ data }: { data: BarChartDatum[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-admin-muted">No nominees yet.</p>;
  }

  const max = Math.max(...data.map((d) => d.votes));
  const total = data.reduce((sum, d) => sum + d.votes, 0);
  const leader = max > 0 ? data.find((d) => d.votes === max)?.id : undefined;

  return (
    <div className="flex flex-col gap-3">
      {data.map((d) => {
        const invalid = max > 0 && d.votes === max;
        return (
          <div key={d.id} className="grid grid-cols-[7rem_1fr_auto] items-center gap-3">
            <span className="truncate text-xs font-semibold uppercase tracking-tight text-admin-fg/80">
              {d.label}
            </span>
            <span className="flex h-5 gap-px" aria-hidden>
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className={`h-full w-6 rounded-[1px] ${
                    i < Math.round((d.votes / Math.max(max, 1)) * 5)
                      ? BAR_LEVELS[Math.min(i + (invalid ? 1 : 0), BAR_LEVELS.length - 1)]
                      : "bg-admin-hover"
                  }`}
                />
              ))}
            </span>
            <span className="font-mono text-xs text-admin-muted">{d.votes}</span>
            <span className="sr-only">
              {d.label}: {d.votes} of {total} votes
            </span>
          </div>
        );
      })}
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-admin-muted">
        {total} total {total === 1 ? "vote" : "votes"}
        {leader ? " · 5 blocks = current leader" : ""}
      </p>
    </div>
  );
}
