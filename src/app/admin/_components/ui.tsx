import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function SectionHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-admin-accent">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-black uppercase leading-none tracking-tighter text-admin-fg lg:text-4xl">
          {title}
        </h1>
        {description && <p className="mt-3 max-w-2xl text-sm text-admin-muted">{description}</p>}
      </div>
      {children}
    </header>
  );
}

export function Notice({ error, saved }: { error?: string; saved?: string }) {
  if (!error && !saved) return null;

  return (
    <div
      role="status"
      className={`mb-6 flex items-center gap-2 border p-3 text-sm ${
        error
          ? "border-admin-danger/30 bg-admin-danger/10 text-admin-danger"
          : "border-admin-accent/30 bg-admin-accent/10 text-admin-accent"
      }`}
    >
      {error ? (
        <AlertCircle aria-hidden className="size-4 shrink-0" />
      ) : (
        <CheckCircle2 aria-hidden className="size-4 shrink-0" />
      )}
      <span>{error || saved}</span>
    </div>
  );
}

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border border-admin-border bg-admin-panel backdrop-blur-md">
      <div className="border-b border-admin-border p-6">
        <h2 className="text-xl font-black uppercase tracking-tight text-admin-fg">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-2 ${className ?? ""}`}>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-admin-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full border border-admin-border bg-admin-input px-3 py-2 text-sm text-admin-fg placeholder-admin-muted focus:border-admin-accent focus:outline-none";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 bg-admin-strong px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-admin-strong-fg transition-opacity hover:opacity-80 disabled:opacity-50";

export const dangerButtonClass =
  "inline-flex items-center justify-center gap-2 border border-admin-danger/40 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-admin-danger transition-colors hover:bg-admin-danger/10";

export const ghostButtonClass =
  "inline-flex items-center justify-center gap-2 border border-admin-border px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-admin-muted transition-colors hover:bg-admin-hover hover:text-admin-fg";
