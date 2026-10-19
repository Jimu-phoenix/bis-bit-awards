import type { Metadata } from "next";
import Image from "next/image";
import { User } from "lucide-react";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Team — Finale Awards",
  description: "The crew behind the BIT/BIS 2026 Finale Awards.",
};

type Member = {
  name: string;
  role: string;
  detail: string;
  image?: string;
};

const MEMBERS: Member[] = [
  {
    name: "Prince Vision Jimu",
    role: "Technical Lead",
    detail: "Architecture, stack and system development",
    image: "/images/phoenix1.png",
  },
  {
    name: "Uchizi Kanyimbo",
    role: "Designer",
    detail: "Look, color and certificate design",
  },
  {
    name: "Lauren Gulule",
    role: "Vote Categories",
    detail: "Vote categories and nominations",
  },
  {
    name: "Michelle Bello",
    role: "Vote Categories",
    detail: "Vote categories and nominations",
  },
  {
    name: "Morrice Nkhoma",
    role: "Team Lead",
    detail: "Roles sharing and management",
  },
];

function MemberCard({ member }: { member: Member }) {
  return (
    <article className="group relative flex flex-col overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-md transition-colors duration-300 hover:border-white/30 hover:bg-white/[0.07]">
      <div className="relative aspect-[4/5] overflow-hidden bg-black/40">
        {member.image ? (
          <Image
            src={member.image}
            alt={member.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center">
            <User
              aria-hidden
              className="size-24 text-white/15 transition-colors group-hover:text-emerald-300/40"
            />
          </div>
        )}
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-emerald-300 to-fuchsia-400 transition-transform duration-500 group-hover:scale-x-100"
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-300">
          {member.role}
        </p>
        <h2 className="mt-3 text-2xl font-black uppercase leading-[0.95] tracking-tight text-white">
          {member.name}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/55">{member.detail}</p>
      </div>
    </article>
  );
}

export default function TeamPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#05060a] text-white selection:bg-emerald-300 selection:text-black">
      <Nav />

      <div className="mx-auto max-w-7xl px-6 pb-24 pt-32 md:pt-40">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-300">
          / The crew
        </p>
        <h1 className="mt-4 text-5xl font-black uppercase leading-[0.9] tracking-tighter text-white md:text-8xl">
          The <span className="text-emerald-300">Team</span>
        </h1>
        <p className="mt-6 max-w-xl text-balance text-base text-white/60 md:text-lg">
          The people who built, designed and run the BIT/BIS 2026 Finale Awards.
        </p>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MEMBERS.map((member) => (
            <MemberCard key={member.name} member={member} />
          ))}
        </div>
      </div>
    </main>
  );
}
