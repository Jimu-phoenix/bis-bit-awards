import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Page not found — Finale Awards",
  description: "This page doesn't exist.",
};

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#05060a] text-white selection:bg-emerald-300 selection:text-black">
      <Nav />

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-32 md:py-40">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-300">
          / 404
        </p>
        <h1 className="mt-4 text-[clamp(4rem,14vw,11rem)] font-black uppercase leading-[0.85] tracking-tighter text-white">
          Lost<span className="text-emerald-300">?</span>
        </h1>
        <p className="mt-8 max-w-xl text-balance text-base text-white/60 md:text-lg">
          This page doesn&apos;t exist — maybe it moved, or the link was wrong.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 border border-white bg-white px-8 py-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-emerald-300 hover:border-emerald-300"
          >
            Back home
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/vote"
            className="inline-flex items-center gap-2 border border-white/25 bg-transparent px-8 py-4 font-mono text-xs uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/10"
          >
            Go vote
          </Link>
        </div>
      </div>
    </main>
  );
}
