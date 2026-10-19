import type { Metadata } from "next";
import { cookies } from "next/headers";
import { requireAdminUser } from "@/lib/admin";
import { getVotingOpen } from "@/lib/voting";
import { AdminSidebar } from "./admin-sidebar";
import { AdminThemeProvider } from "./_components/theme-provider";
import { ADMIN_THEME_COOKIE, resolveAdminTheme } from "./_components/theme";

export const metadata: Metadata = {
  title: "Admin — Finale Awards",
  description: "Admin dashboard for Finale Awards voting.",
};

export const instant = false;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminUser();

  const [cookieStore, votingOpen] = await Promise.all([cookies(), getVotingOpen()]);
  const initialTheme = resolveAdminTheme(cookieStore.get(ADMIN_THEME_COOKIE)?.value);

  return (
    <AdminThemeProvider initialTheme={initialTheme}>
      <AdminSidebar votingOpen={votingOpen} />
      <main className="lg:pl-72">
        <div className="mx-auto max-w-6xl px-5 py-8 lg:px-10 lg:py-12">{children}</div>
      </main>
    </AdminThemeProvider>
  );
}
