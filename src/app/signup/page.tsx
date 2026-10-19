"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, Loader2, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";

const EMAIL_PATTERN = /^(bis|bit)2[12]-[a-z0-9._-]+@mubas\.ac\.mw$/i;

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!EMAIL_PATTERN.test(email.toLowerCase())) {
      setError(
        "Invalid email format. Use bis21-name@mubas.ac.mw or bit22-name@mubas.ac.mw"
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Sign up failed");
        return;
      }

      router.push("/vote");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create Account"
      subtitle="Use your MUBAS BIS/BIT email to register"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/signin" className="ml-1 text-emerald-300 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4" aria-busy={loading}>
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 border border-fuchsia-400/20 bg-fuchsia-400/10 p-3 text-sm text-fuchsia-300"
          >
            <AlertCircle aria-hidden className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block font-mono text-xs uppercase tracking-[0.2em] text-white/70"
          >
            MUBAS Email
          </label>
          <div className="relative">
            <Mail
              aria-hidden
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40"
            />
            <input
              id="email"
              type="email"
              placeholder="bis21-jdoe@mubas.ac.mw"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:border-emerald-300 focus:outline-none disabled:opacity-60"
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            Format: bis21-jdoe@mubas.ac.mw or bit22-asmith@mubas.ac.mw
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block font-mono text-xs uppercase tracking-[0.2em] text-white/70"
          >
            Password
          </label>
          <div className="relative">
            <Lock
              aria-hidden
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40"
            />
            <input
              id="password"
              type="password"
              placeholder="******** (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:border-emerald-300 focus:outline-none disabled:opacity-60"
              required
              autoComplete="new-password"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="block font-mono text-xs uppercase tracking-[0.2em] text-white/70"
          >
            Confirm Password
          </label>
          <div className="relative">
            <Lock
              aria-hidden
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40"
            />
            <input
              id="confirmPassword"
              type="password"
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:border-emerald-300 focus:outline-none disabled:opacity-60"
              required
              autoComplete="new-password"
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 bg-white py-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 aria-hidden className="size-4 animate-spin" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
