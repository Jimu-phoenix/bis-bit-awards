import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, ShieldX, ArrowUpRight } from "lucide-react";
import Nav from "@/components/Nav";
import { getCertificateByCode } from "@/lib/certificates";

export const instant = false;

export const metadata: Metadata = {
  title: "Verify certificate — Finale Awards",
  description: "Verify the authenticity of a BIT/BIS 2026 Finale Awards certificate.",
};

export default async function VerifyPage(props: PageProps<"/verify/[id]">) {
  const { id } = await props.params;
  const code = decodeURIComponent(id ?? "").trim();

  let certificate = null;
  let lookupFailed = false;
  try {
    certificate = await getCertificateByCode(code);
  } catch {
    lookupFailed = true;
  }

  const legit = Boolean(certificate);

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#05060a] text-white selection:bg-emerald-300 selection:text-black">
      <Nav />

      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-32 md:py-40">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">
          / Certificate verification
        </p>

        <div
          className={
            "mt-8 flex flex-col items-center border p-10 text-center " +
            (legit
              ? "border-emerald-300/40 bg-emerald-300/[0.05]"
              : "border-red-500/50 bg-red-500/[0.06]")
          }
        >
          {legit ? (
            <BadgeCheck className="size-16 text-emerald-300" />
          ) : (
            <ShieldX className="size-16 text-red-400" />
          )}

          <h1
            className={
              "mt-6 text-4xl font-black uppercase leading-[0.95] tracking-tighter md:text-6xl " +
              (legit ? "text-emerald-300" : "text-red-400")
            }
          >
            {legit ? "Legit certificate" : "Fake certificate"}
          </h1>

          <p className="mt-4 max-w-md text-balance text-sm text-white/60 md:text-base">
            {lookupFailed
              ? "We couldn't verify this certificate right now. Please try again later."
              : legit
                ? "This certificate was issued by the BIT/BIS 2026 Finale Awards organizers and is authentic."
                : "This code does not match any certificate issued by the BIT/BIS 2026 Finale Awards."}
          </p>

          <p className="mt-6 font-mono text-xs uppercase tracking-[0.25em] text-white/50">
            {code || "—"}
          </p>

          {certificate && (
            <dl className="mt-8 grid w-full max-w-sm gap-4 border-t border-white/10 pt-8 text-left">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
                  Recipient
                </dt>
                <dd className="mt-1 text-lg font-black uppercase tracking-tight text-white">
                  {certificate.nominee_name}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
                  Category
                </dt>
                <dd className="mt-1 text-lg font-black uppercase tracking-tight text-white">
                  {certificate.category_title}
                </dd>
              </div>
            </dl>
          )}
        </div>

        <Link
          href="/"
          className="group mt-8 inline-flex items-center gap-2 self-center font-mono text-xs uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white"
        >
          Back home
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </main>
  );
}
