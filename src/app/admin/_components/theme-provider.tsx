"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ADMIN_THEME_COOKIE, type AdminTheme } from "./theme";

type AdminThemeContextValue = {
  theme: AdminTheme;
  setTheme: (theme: AdminTheme) => void;
};

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

export function AdminThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme: AdminTheme;
  children: ReactNode;
}) {
  const [theme, setThemeState] = useState<AdminTheme>(initialTheme);

  const setTheme = (next: AdminTheme) => {
    setThemeState(next);
    document.cookie = `${ADMIN_THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  };

  return (
    <AdminThemeContext.Provider value={{ theme, setTheme }}>
      <div data-admin-theme={theme} className="min-h-screen bg-admin-bg font-sans text-admin-fg">
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error("useAdminTheme must be used within an AdminThemeProvider");
  }
  return context;
}
