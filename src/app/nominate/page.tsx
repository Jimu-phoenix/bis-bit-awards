// Commented out - Nomination period closed
// import type { Metadata } from "next";
// import { redirect } from "next/navigation";
// import { getPool } from "@/lib/db";
// import { getVotingOpen } from "@/lib/voting";
// import { getSession } from "@/lib/auth-server";
// import Nav from "@/components/Nav";
// import { submitNomination } from "@/app/actions";
// import CategorySelector from "./category-selector";
// 
// export const metadata: Metadata = {
//   title: "Nominate — Finale Awards",
//   description: "Submit your nominations for the BIT/BIS 2026 Finale Awards.",
// };
// 
// export const instant = false;
// 
// type Category = {
//   id: string;
//   slug: string;
//   title: string;
//   blurb: string;
//   sort_order: number;
// };
// 
// async function getCategories(): Promise<Category[]> {
//   const { rows } = await getPool().query<Category>(
//     "select id, slug, title, blurb, sort_order from categories order by sort_order, id"
//   );
//   return rows;
// }
// 
// export default async function NominatePage({
//   searchParams,
// }: {
//   searchParams: Promise<{ error?: string; success?: string }>;
// }) {
//   const session = await getSession();
//   const votingOpen = await getVotingOpen();
//   const categories = await getCategories();
//   const params = await searchParams;
//   const error = params.error;
//   const success = params.success;
// 
//   if (!session?.user) {
//     redirect("/signin?callbackUrl=/nominate");
//   }
// 
//   return (
//     <main className="relative min-h-screen overflow-x-clip bg-[#05060a] text-white selection:bg-emerald-300 selection:text-black">
//       <Nav />
// 
//       <div className="mx-auto max-w-3xl px-6 py-24 md:py-32">
//         <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-300">
//           / Nominate
//         </p>
//         <h1 className="mt-4 text-5xl font-black uppercase leading-[0.9] tracking-tighter text-white md:text-7xl">
//           Submit a <span className="text-emerald-300">Nomination</span>
//         </h1>
// 
//         {error && (
//           <div className="mt-8 border border-fuchsia-400/40 bg-fuchsia-400/5 p-4 text-center">
//             <p className="text-fuchsia-300">{error}</p>
//           </div>
//         )}
//         {success && (
//           <div className="mt-8 border border-emerald-400/40 bg-emerald-400/5 p-4 text-center">
//             <p className="text-emerald-300">{success}</p>
//           </div>
//         )}
// 
//         {votingOpen && (
//           <div className="mt-10 border border-fuchsia-400/40 bg-fuchsia-400/5 p-6 text-center">
//             <p className="text-lg font-black uppercase tracking-tight text-fuchsia-300">
//               Cannot nominate when voting is open
//             </p>
//             <p className="mt-2 text-white/70">
//               Nominations will reopen after the voting period closes.
//             </p>
//           </div>
//         )}
// 
//         {!votingOpen && (
//           <>
//             <p className="mt-8 max-w-xl text-white/60">
//               Help decide who makes the ballot. Pick a category and add a name.
//               If someone else already nominated them, their seed count increases.
//             </p>
// 
//             <form action={submitNomination} className="mt-10 space-y-6">
//               <CategorySelector categories={categories} />
// 
//               <div>
//                 <label
//                   htmlFor="name"
//                   className="block font-mono text-xs uppercase tracking-[0.3em] text-emerald-300 mb-2"
//                 >
//                   Nominee Name
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   id="name"
//                   required
//                   maxLength={80}
//                   placeholder="e.g. joe.doe"
//                   className="w-full rounded-none border border-white/20 bg-black/40 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-emerald-300 focus:bg-black/60"
//                 />
//               </div>
// 
//               <div>
//                 <label
//                   htmlFor="blurb"
//                   className="block font-mono text-xs uppercase tracking-[0.3em] text-emerald-300 mb-2"
//                 >
//                   Why them? (optional)
//                 </label>
//                 <textarea
//                   name="blurb"
//                   id="blurb"
//                   maxLength={300}
//                   rows={3}
//                   placeholder="They debugged the final project at 4am and saved the group..."
//                   className="w-full rounded-none border border-white/20 bg-black/40 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-emerald-300 focus:bg-black/60 resize-none"
//                 />
//               </div>
// 
//               <button
//                 type="submit"
//                 className="w-full rounded-none bg-white px-8 py-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-black hover:bg-emerald-300 transition-colors"
//               >
//                 Submit Nomination
//               </button>
//             </form>
// 
//             <p className="mt-6 text-sm text-white/50 text-center">
//               Nominations are anonymous. Only the seed count is shown publicly.
//             </p>
//           </>
//         )}
//       </div>
//     </main>
//   );
// }
// 
// async function nominateAction(formData: FormData) {
//   const { nominate } = await import("@/app/actions");
//   const result = await nominate({
//     categoryId: String(formData.get("categoryId") ?? ""),
//     name: String(formData.get("name") ?? ""),
//     blurb: String(formData.get("blurb") ?? ""),
//   });
// 
//   if (!result.ok) {
//     redirect(`/nominate?error=${encodeURIComponent(result.error)}`);
//   }
//   redirect(
//     `/nominate?success=${encodeURIComponent(
//       result.message === "seed counted"
//         ? "Seed counted \u2014 their nomination is now stronger."
//         : "Nomination submitted."
//     )}`
//   );
// }

import type { Metadata } from "next";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Nominate — Finale Awards",
  description: "Nomination period is currently closed.",
};

export const instant = false;

export default function NominatePage() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#05060a] text-white selection:bg-emerald-300 selection:text-black">
      <Nav />

      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-32 md:py-40">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-300">
          / Nominate
        </p>
        <h1 className="mt-4 text-5xl font-black uppercase leading-[0.9] tracking-tighter text-white md:text-7xl">
          Nomination period <span className="text-emerald-300">closed</span>
        </h1>
        <p className="mt-6 max-w-xl text-balance text-base text-white/60 md:text-lg">
          The nomination period has ended. Nominations will reopen after the voting period closes.
        </p>
      </div>
    </main>
  );
}