import { cookies, headers } from "next/headers";
import { parseSetCookieHeader } from "@/lib/set-cookie";

export type AuthSessionUser = {
  id: string;
  email: string;
  name?: string | null;
  [key: string]: unknown;
};

export type AuthSession = {
  user: AuthSessionUser;
  session?: unknown;
};

async function getRequestCookies(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.toString();
}

function extractNeonAuthCookies(cookieHeader: string): string {
  if (!cookieHeader) return "";
  return cookieHeader
    .split(";")
    .map((c) => c.trim())
    .filter((c) => c.startsWith("__Secure-neon-auth"))
    .join("; ");
}

export async function getSession(): Promise<AuthSession | null> {
  try {
    const cookieHeader = await getRequestCookies();
    const neonAuthCookies = extractNeonAuthCookies(cookieHeader);

    const response = await fetch(`${process.env.NEON_AUTH_BASE_URL}/get-session`, {
      method: "GET",
      headers: {
        Cookie: neonAuthCookies,
      },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data = (await response.json()) as Partial<AuthSession> | null;
    return data && data.user ? (data as AuthSession) : null;
  } catch {
    return null;
  }
}

export async function signOut(): Promise<void> {
  const cookieHeader = await getRequestCookies();
  const neonAuthCookies = extractNeonAuthCookies(cookieHeader);
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;

  const response = await fetch(`${process.env.NEON_AUTH_BASE_URL}/sign-out`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: neonAuthCookies,
      ...(origin ? { Origin: origin } : {}),
    },
    body: "{}",
  });

  const setCookieHeader = response.headers.get("Set-Cookie");
  if (setCookieHeader) {
    const cookieStore = await cookies();
    for (const cookie of parseSetCookieHeader(setCookieHeader)) {
      cookieStore.set(cookie.name, "", { ...cookie.options, maxAge: 0 });
    }
  }
}
