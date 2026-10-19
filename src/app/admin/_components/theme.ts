export type AdminTheme = "dark" | "light" | "system";

export const ADMIN_THEME_COOKIE = "finale-admin-theme";

export const ADMIN_THEMES: AdminTheme[] = ["dark", "light", "system"];

export function resolveAdminTheme(value: string | undefined | null): AdminTheme {
  return ADMIN_THEMES.includes(value as AdminTheme) ? (value as AdminTheme) : "system";
}
