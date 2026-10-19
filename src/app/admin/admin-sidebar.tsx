"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Award,
  BarChart3,
  Layers,
  LogOut,
  ScrollText,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { AdminThemeToggle } from "./_components/theme-toggle";
import { VotingToggle } from "./_components/voting-toggle";

const ITEMS: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/admin", label: "Vote Counts", icon: BarChart3 },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/nominees", label: "Nominees", icon: Award },
  { href: "/admin/users", label: "Users and Roles", icon: Users },
  { href: "/admin/logs", label: "Logs", icon: ScrollText },
];

export function AdminSidebar({ votingOpen }: { votingOpen: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 border px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] transition-colors ${
      active
        ? "border-admin-accent/30 bg-admin-accent/10 text-admin-accent"
        : "border-transparent text-admin-muted hover:border-admin-border hover:bg-admin-hover hover:text-admin-fg"
    }`;

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-admin-border bg-admin-bg/85 backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-2 border-b border-admin-border px-6 py-5">
          <span className="grid size-8 place-items-center border border-admin-border bg-admin-input">
            <Trophy className="size-4 text-admin-accent" />
          </span>
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-admin-fg">
            Finale<span className="text-admin-accent">/26</span>
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          {ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={linkClass(isActive(href))}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3 border-t border-admin-border p-4">
          <VotingToggle votingOpen={votingOpen} />
          <div className="flex items-center justify-between gap-3 border-t border-admin-border pt-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-admin-muted">
              Theme
            </span>
            <AdminThemeToggle />
          </div>
          <div className="flex flex-col gap-1">
            <Link
              href="/vote"
              className="flex items-center gap-3 border border-transparent px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] text-admin-muted transition-colors hover:border-admin-border hover:bg-admin-hover hover:text-admin-fg"
            >
              <ArrowLeft className="size-4" />
              Back to Site
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-3 border border-transparent px-4 py-3 text-left font-mono text-xs uppercase tracking-[0.2em] text-admin-muted transition-colors hover:border-admin-border hover:bg-admin-hover hover:text-admin-fg"
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="sticky top-0 z-40 border-b border-admin-border bg-admin-bg/90 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-admin-accent" />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-admin-fg">
              Admin
            </span>
          </div>
          <AdminThemeToggle />
        </div>
        <div className="border-t border-admin-border px-5 py-4">
          <VotingToggle votingOpen={votingOpen} />
        </div>
        <nav className="flex gap-2 overflow-x-auto px-5 pb-4">
          {ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors ${
                isActive(href)
                  ? "border-admin-accent/30 bg-admin-accent/10 text-admin-accent"
                  : "border-admin-border text-admin-muted"
              }`}
            >
              <Icon className="size-3.5" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
