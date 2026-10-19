"use client";

import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useAdminTheme } from "./theme-provider";
import type { AdminTheme } from "./theme";

const OPTIONS: Array<{ value: AdminTheme; label: string; icon: LucideIcon }> = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
];

export function AdminThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useAdminTheme();

  return (
    <div
      role="group"
      aria-label="Dashboard theme"
      className={`flex shrink-0 items-center gap-0.5 border border-admin-border p-0.5 ${
        className ?? ""
      }`}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={isActive}
            aria-label={`${label} theme`}
            title={`${label} theme`}
            className={`grid size-8 shrink-0 place-items-center transition-colors ${
              isActive
                ? "bg-admin-accent/15 text-admin-accent"
                : "text-admin-muted hover:bg-admin-hover hover:text-admin-fg"
            }`}
          >
            <Icon aria-hidden className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
