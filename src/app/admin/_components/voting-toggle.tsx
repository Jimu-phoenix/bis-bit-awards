"use client";

import { useTransition } from "react";
import { usePathname } from "next/navigation";
import { Power } from "lucide-react";
import { toggleVoting } from "../actions";

export function VotingToggle({ votingOpen }: { votingOpen: boolean }) {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const statusClass = votingOpen
    ? "border-admin-accent/30 bg-admin-accent/10 text-admin-accent"
    : "border-admin-danger/30 bg-admin-danger/10 text-admin-danger";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-admin-muted">
          Voting
        </span>
        <span
          className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] ${statusClass}`}
        >
          {votingOpen ? "Active" : "Closed"}
        </span>
      </div>

      <form action={(formData) => startTransition(() => toggleVoting(formData))}>
        <input type="hidden" name="open" value={String(!votingOpen)} />
        <input type="hidden" name="path" value={pathname} />
        <button
          type="submit"
          disabled={pending}
          aria-label={votingOpen ? "Close the voting period" : "Open the voting period"}
          className="flex w-full items-center gap-3 border border-admin-border px-4 py-3 text-left font-mono text-xs uppercase tracking-[0.2em] text-admin-muted transition-colors hover:bg-admin-hover hover:text-admin-fg disabled:opacity-50"
        >
          <Power className="size-4" />
          {pending ? "Updating…" : "Toggle voting"}
        </button>
      </form>
    </div>
  );
}
