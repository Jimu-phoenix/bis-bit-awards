import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import {
  Award,
  Crown,
  Code2,
  Handshake,
  Laugh,
  Lightbulb,
  Shirt,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import Nav from "@/components/Nav";
import { getCategories, getNominees } from "@/lib/db";

export const metadata: Metadata = {
  title: "Vote — Finale Awards",
  description: "Cast your votes for the BIS / BIT Class of 2026 finale awards.",
};

const ICONS: Record<string, LucideIcon> = {
  "most-likely-to-succeed": Crown,
  "code-wizard": Code2,
  "best-final-year-project": Lightbulb,
  "class-clown": Laugh,
  "best-dressed": Shirt,
  "most-helpful": Handshake,
  "finale-icon": Sparkles,
};

async function VoteContent() {
  await connection();

  let error: string | null = null;
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let nominees: Awaited<ReturnType<typeof getNominees>> = [];

  try {
    [categories, nominees] = await Promise.all([getCategories(), getNominees()]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not reach the database.";
  }

  const byCategory = new Map<string, typeof nominees>();
  for (const nominee of nominees) {
    const list = byCategory.get(nominee.category_id) ?? [];
    list.push(nominee);
    byCategory.set(nominee.category_id, list);
  }

  return (
    <section className="mx-auto max-w-6xl px-6 pt-36 pb-24 md:pt-44">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-300">
        / Vote
      </p>
      <h1 className="mt-3 text-5xl font-black uppercase leading-[0.9] tracking-tighter text-white md:text-8xl">
        Cast your <span className="text-emerald-300">votes.</span>
      </h1>
      <p className="mt-6 max-w-xl text-white/60">
        One class, one ballot. Pick one name per category — tallies below are
        read live from the database.
      </p>

      {error ? (
        <div className="mt-12 border border-fuchsia-400/40 bg-fuchsia-400/5 p-6">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-fuchsia-300">
            Database unavailable
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/70">{error}</p>
        </div>
      ) : (
        <p className="mt-8 font-mono text-xs uppercase tracking-[0.3em] text-white/40">
          {categories.length} categories &middot; {nominees.length} nominees
        </p>
      )}

      <div className="mt-10 flex flex-col gap-4">
        {categories.map((category, i) => {
          const Icon = ICONS[category.slug] ?? Award;
          const list = byCategory.get(category.id) ?? [];
          return (
            <article
              key={category.id}
              className="relative flex flex-col overflow-hidden border border-white/10 bg-white/[0.03] p-7 backdrop-blur-md"
            >
              <span
                aria-hidden
                className="absolute -right-4 -top-8 select-none text-[9rem] font-black leading-none text-white/[0.04]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="flex items-center gap-4">
                <span className="grid size-12 shrink-0 place-items-center border border-white/15 bg-black/40 text-emerald-300">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h2 className="text-2xl font-black uppercase leading-none tracking-tight text-white md:text-3xl">
                    {category.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">
                    {category.blurb}
                  </p>
                </div>
              </div>

              {list.length === 0 ? (
                <p className="mt-6 border-t border-white/10 pt-5 font-mono text-xs uppercase tracking-[0.2em] text-white/40">
                  Nominations not open yet
                </p>
              ) : (
                <ul className="mt-6 flex flex-col border-t border-white/10">
                  {list.map((nominee) => (
                    <li
                      key={nominee.id}
                      className="flex items-center justify-between gap-4 border-b border-white/5 py-4 last:border-b-0"
                    >
                      <div>
                        <p className="text-lg font-bold uppercase tracking-tight text-white">
                          {nominee.name}
                        </p>
                        {nominee.blurb ? (
                          <p className="mt-1 text-sm text-white/50">
                            {nominee.blurb}
                          </p>
                        ) : null}
                      </div>
                      <span className="shrink-0 border border-white/15 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-emerald-300">
                        {nominee.votes} vote{nominee.votes === 1 ? "" : "s"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function VotePage() {
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

      <Suspense
        fallback={
          <section className="mx-auto max-w-6xl px-6 pt-36 pb-24 md:pt-44">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-300">
              / Vote
            </p>
            <p className="mt-8 font-mono text-xs uppercase tracking-[0.3em] text-white/40">
              Loading categories…
            </p>
          </section>
        }
      >
        <VoteContent />
      </Suspense>

      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.25em] text-white/40 md:flex-row">
          <span>Finale Awards &middot; BIS / BIT Class of 2026</span>
          <span>Vote &middot; production branch</span>
        </div>
      </footer>
    </main>
  );
}
