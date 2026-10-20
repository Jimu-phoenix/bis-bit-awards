"use client";

import { useState, useEffect } from "react";
import {
  Vote as VoteIcon,
  CheckCircle,
  Loader2,
  Crown,
  Code2,
  Handshake,
  Laugh,
  Lightbulb,
  Shirt,
  Sparkles,
  Award,
  Lock,
  type LucideIcon,
} from "lucide-react";

import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";

const ICONS: Record<string, LucideIcon> = {
  "most-likely-to-succeed": Crown,
  "code-wizard": Code2,
  "best-final-year-project": Lightbulb,
  "class-clown": Laugh,
  "best-dressed": Shirt,
  "most-helpful": Handshake,
  "finale-icon": Sparkles,
};

interface VoteTotals {
  category_id: string;
  slug: string;
  title: string;
  nominees: Array<{
    id: string;
    name: string;
    blurb: string;
    votes: number;
    seed: number;
  }>;
}

export function VoteClient({ sessionKey = "anonymous" }: { sessionKey?: string }) {
  const [categories, setCategories] = useState<VoteTotals[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [votingOpen, setVotingOpen] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const statusRes = await fetch("/api/vote/status");
        if (!statusRes.ok) throw new Error("Failed to fetch voting status");
        const status: { open: boolean } = await statusRes.json();
        if (!active) return;

        setVotingOpen(status.open);
        if (!status.open) {
          setLoading(false);
          return;
        }

        const [totalsRes, userRes] = await Promise.all([
          fetch("/api/vote/totals"),
          fetch("/api/vote/user"),
        ]);
        if (!active) return;
        if (!totalsRes.ok) throw new Error("Failed to fetch vote totals");

        const data: VoteTotals[] = await totalsRes.json();
        if (!active) return;
        setCategories(
          (data ?? []).map((c) => ({ ...c, nominees: c.nominees ?? [] })),
        );

        if (userRes.ok) {
          const userData: Array<{ category_id: string; nominee_id: string }> | null =
            await userRes.json();
          if (!active || !userData) return;
          const votesMap: Record<string, string> = {};
          userData.forEach((v) => {
            votesMap[v.category_id] = v.nominee_id;
          });
          setUserVotes(votesMap);
        }
      } catch {
        if (active) setError("Failed to load vote totals");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [sessionKey]);

  const handleVote = async (categoryId: string, nomineeId: string) => {
    if (voting[categoryId]) return;
    if (votingOpen === false) {
      showToast("Voting period is closed", "error");
      return;
    }

    setVoting((prev) => ({ ...prev, [categoryId]: true }));
    setError(null);

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomineeId, categoryId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to submit vote");
      }

      setUserVotes((prev) => ({ ...prev, [categoryId]: nomineeId }));
      setCategories((prev) =>
        prev.map((cat) => {
          if (cat.category_id !== categoryId) return cat;
          return {
            ...cat,
            nominees: cat.nominees.map((n) =>
              n.id === nomineeId ? { ...n, votes: n.votes + 1 } : n
            ),
          };
        })
      );

      showToast("Vote submitted!", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit vote";
      setError(message);
      showToast(message, "error");
    } finally {
      setVoting((prev) => ({ ...prev, [categoryId]: false }));
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-x-clip bg-[#05060a] text-white selection:bg-emerald-300 selection:text-black">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.35) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage:
              "radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)",
          }}
        />
        <Nav />
        <section className="mx-auto max-w-6xl px-6 pt-36 pb-24 md:pt-44">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-300">
            / Vote
          </p>
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.3em] text-white/40">
            Loading categories...
          </p>
        </section>
        <footer className="border-t border-white/10 px-6 py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.25em] text-white/40 md:flex-row">
            <span>Finale Awards · BIS / BIT Class of 2026</span>
            <span>Vote · production branch</span>
          </div>
        </footer>
      </main>
    );
  }

  if (votingOpen === false) {
    return (
      <main className="relative min-h-screen overflow-x-clip bg-[#05060a] text-white selection:bg-emerald-300 selection:text-black">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.35) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)",
          }}
        />
        <Nav />
        <section className="mx-auto max-w-6xl px-6 pt-36 pb-24 md:pt-44">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-fuchsia-300">/ Vote</p>
          <h1 className="mt-3 text-5xl font-black uppercase leading-[0.9] tracking-tighter text-white md:text-8xl">
            Voting period <span className="text-fuchsia-300">closed.</span>
          </h1>
          <p className="mt-6 max-w-xl text-white/60">
            Ballots are locked for now. Winners are revealed on the day — check back when the
            voting period reopens.
          </p>
          <div className="mt-10 inline-flex items-center gap-3 border border-fuchsia-400/40 bg-fuchsia-400/5 px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] text-fuchsia-300">
            <Lock className="size-4" />
            Voting period closed
          </div>

          <div className="mt-10">
            <a
              href="/nominate"
              className="inline-flex items-center gap-2 rounded-none bg-white px-8 py-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-black hover:bg-emerald-300 transition-colors"
            >
              Nominate
            </a>
          </div>
        </section>
        <footer className="border-t border-white/10 px-6 py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.25em] text-white/40 md:flex-row">
            <span>Finale Awards · BIS / BIT Class of 2026</span>
            <span>Vote</span>
          </div>
        </footer>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#05060a] text-white selection:bg-emerald-300 selection:text-black">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)",
        }}
      />

      <Nav />

      <section className="mx-auto max-w-6xl px-6 pt-36 pb-24 md:pt-44">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-300">
          / Vote
        </p>
        <h1 className="mt-3 text-5xl font-black uppercase leading-[0.9] tracking-tighter text-white md:text-8xl">
          Cast your <span className="text-emerald-300">votes.</span>
        </h1>
        <p className="mt-6 max-w-xl text-white/60">
          One class, one ballot. Pick one name per category. Tallies stay hidden until the voting
          period closes.
        </p>

        {error && (
          <div className="mt-8 mb-6 border border-fuchsia-400/40 bg-fuchsia-400/5 p-4 flex items-center gap-2">
            <span className="size-5 text-fuchsia-300 flex-shrink-0">!</span>
            <p className="text-sm leading-relaxed text-white/70">{error}</p>
          </div>
        )}

        <div className="mt-8 font-mono text-xs uppercase tracking-[0.3em] text-white/40">
          {categories.length} categories · {categories.reduce((sum, c) => sum + (c.nominees?.length ?? 0), 0)} nominees
        </div>

        <div className="mt-10 flex flex-col gap-4">
          {categories.map((category, i) => {
            const Icon = ICONS[category.slug] ?? Award;
            const list = [...category.nominees]
              .sort((a, b) => (b.seed ?? 0) - (a.seed ?? 0))
              .slice(0, 5);

            return (
              <article
                key={category.category_id}
                className="relative flex flex-col overflow-hidden border border-white/10 bg-white/[0.03] p-7 backdrop-blur-md"
              >
                <span
                  aria-hidden
                  className="absolute -right-4 -top-8 select-none text-[9rem] font-black leading-none text-white/[0.04]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="flex items-center gap-4 mb-4">
                  <span className="grid size-12 shrink-0 place-items-center border border-white/15 bg-black/40 text-emerald-300">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-2xl font-black uppercase leading-none tracking-tight text-white md:text-3xl">
                      {category.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">
                      {list.length === 0 ? "Nominations not open yet" : list.length + " nominees"}
                    </p>
                  </div>
                </div>

                {list.length === 0 ? (
                  <p className="mt-6 border-t border-white/10 pt-5 font-mono text-xs uppercase tracking-[0.2em] text-white/40">
                    Nominations not open yet
                  </p>
                ) : (
                  <ul className="mt-6 flex flex-col border-t border-white/10">
                    {list.map((nominee) => {
                      const isSelected = userVotes[category.category_id] === nominee.id;
                      return (
                        <li
                          key={nominee.id}
                          className={`flex items-center justify-between gap-4 border-b border-white/5 py-4 last:border-b-0 transition-colors ${
                            isSelected
                              ? "bg-emerald-300/5 border-l-4 border-l-emerald-300 pl-4"
                              : ""
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <p className="text-lg font-bold uppercase tracking-tight text-white">
                                {nominee.name}
                              </p>
                              {isSelected && (
                                <CheckCircle className="size-5 text-emerald-300 flex-shrink-0" />
                              )}
                            </div>
                            {nominee.blurb && (
                              <p className="mt-1 text-sm text-white/50">
                                {nominee.blurb}
                              </p>
                            )}
                            <p className="mt-2 flex items-center gap-2 text-xs text-white/40">
                              <span className="font-mono">seed: {nominee.seed ?? 0}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {userVotes[category.category_id] ? (
                              <span className="shrink-0 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-emerald-300 bg-emerald-300/10 border border-emerald-300/20">
                                Voted
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVote(category.category_id, nominee.id)}
                                disabled={!!userVotes[category.category_id] || voting[category.category_id]}
                                className="rounded-none border-white/25 bg-transparent px-4 font-mono text-xs uppercase tracking-[0.2em] text-white hover:bg-white/10 hover:text-white disabled:opacity-50"
                              >
                                {voting[category.category_id] ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <>
                                    <VoteIcon className="size-3.5 mr-1.5" />
                                    Vote
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {toast && (
        <div
          className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-4 py-3 rounded-none border backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300 ${
            toast.type === "success"
              ? "border-emerald-300/50 bg-emerald-300/10 text-emerald-300"
              : "border-fuchsia-400/50 bg-fuchsia-400/10 text-fuchsia-400"
          }`}
        >
          <span className="font-mono text-xs uppercase tracking-[0.2em]">{toast.message}</span>
        </div>
      )}

      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.25em] text-white/40 md:flex-row">
          <span>Finale Awards · BIS / BIT Class of 2026</span>
          <span>Vote</span>
        </div>
      </footer>

      <style jsx>{`
        main {
          background-color: #05060a;
        }
      `}</style>
    </main>
  );
}