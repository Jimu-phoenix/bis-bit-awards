"use client";

import { useCallback, useEffect, useState } from "react";

export type SessionUser = {
  id: string;
  email: string;
  fullname: string;
};

async function fetchSession(): Promise<SessionUser | null> {
  try {
    const res = await fetch("/api/session", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { user: SessionUser | null };
    return data?.user ?? null;
  } catch {
    return null;
  }
}

export async function signOut(): Promise<void> {
  await fetch("/api/auth/sign-out", { method: "POST" });
}

export const authClient = { signOut };

export function useSession() {
  const [data, setData] = useState<{ user: SessionUser | null } | null>(null);
  const [isPending, setIsPending] = useState(true);

  const refresh = useCallback(async () => {
    const user = await fetchSession();
    setData({ user });
    setIsPending(false);
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      const user = await fetchSession();
      if (!active) return;
      setData({ user });
      setIsPending(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  return { data, isPending, refresh };
}
