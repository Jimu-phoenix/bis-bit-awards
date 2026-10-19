import type { Metadata } from "next";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Gallery — Finale Awards",
  description: "Four years in frames — BIT/BIS 2026 Finale Awards gallery.",
};

export default function GalleryPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#05060a] text-white selection:bg-emerald-300 selection:text-black">
      <Nav />

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-32 md:py-40">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-300">
          / Gallery
        </p>
        <h1 className="mt-4 text-5xl font-black uppercase leading-[0.9] tracking-tighter text-white md:text-8xl">
          Four years in <span className="text-emerald-300">frames</span>
        </h1>
        <p className="mt-10 max-w-3xl text-balance text-3xl font-black leading-[1.05] tracking-tight text-white md:text-6xl">
          Ma picture simunatipatse nde mufuna muone cha?
        </p>
      </div>
    </main>
  );
}
