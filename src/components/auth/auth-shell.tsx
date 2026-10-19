import type { ReactNode } from "react";
import { Trophy } from "lucide-react";
import { MatrixRain } from "./matrix-rain";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="relative min-h-screen bg-[#05060a] text-white selection:bg-emerald-300 selection:text-black">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative flex flex-col items-center justify-center px-6 py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.16]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.35) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
              maskImage: "radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)",
            }}
          />

          <div className="relative flex w-full max-w-md flex-col">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-black uppercase tracking-tight text-white">{title}</h1>
              <p className="mt-2 text-sm text-white/60">{subtitle}</p>
            </div>

            {children}

            <p className="mt-6 text-center font-mono text-xs uppercase tracking-[0.2em] text-white/50">
              {footer}
            </p>
          </div>
        </section>

        <section className="relative hidden overflow-hidden border-l border-white/10 lg:block">
          <MatrixRain className="absolute inset-0 size-full" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="grid size-40 place-items-center border border-emerald-300/30 bg-black/50 backdrop-blur-sm">
              <Trophy aria-hidden className="size-20 text-emerald-300" />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-8 text-center font-mono text-[10px] uppercase tracking-[0.35em] text-emerald-300/70">
            Finale Awards &middot; BIS / BIT &middot; Class of 2026
          </div>
        </section>
      </div>
    </main>
  );
}
