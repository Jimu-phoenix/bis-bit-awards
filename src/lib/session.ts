import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getPool } from "@/lib/db";

export const SESSION_COOKIE = "bit-bis.session";
const SESSION_TTL_DAYS = 30;
const SESSION_TTL_SECONDS = SESSION_TTL_DAYS * 24 * 60 * 60;

export type SessionUser = {
  id: string;
  email: string;
  fullname: string;
};

export type Session = {
  id: string;
  user: SessionUser;
};

function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

export function sessionCookieOptions(isSecure: boolean) {
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export async function createSession(userId: string, isSecure: boolean): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  await getPool().query(
    "insert into sessions (id, user_id, expires_at) values ($1, $2, $3)",
    [token, userId, expiresAt]
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions(isSecure));

  return token;
}

export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    try {
      await getPool().query("delete from sessions where id = $1", [token]);
    } catch {
      // ignore — cookie is cleared regardless
    }
  }

  cookieStore.set(SESSION_COOKIE, "", { ...sessionCookieOptions(false), maxAge: 0 });
}

/**
 * Resolve the session for the current request from its cookie. Returns null when
 * there is no cookie, the session is unknown, or it has expired.
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  return resolveSession(token);
}

/**
 * Look up a session token directly (used by the proxy, which has the raw
 * request cookie rather than the `cookies()` store).
 */
export async function resolveSession(token: string): Promise<Session | null> {
  if (!token) return null;

  try {
    const { rows } = await getPool().query<{
      id: string;
      user_id: string;
      email: string;
      fullname: string;
      expires_at: Date;
    }>(
      `select s.id, s.user_id, s.expires_at, u.email, u.fullname
       from sessions s
       join users u on u.id = s.user_id
       where s.id = $1
       limit 1`,
      [token]
    );

    const row = rows[0];
    if (!row) return null;

    if (new Date(row.expires_at).getTime() <= Date.now()) {
      await getPool().query("delete from sessions where id = $1", [token]);
      return null;
    }

    return {
      id: row.id,
      user: { id: String(row.user_id), email: row.email, fullname: row.fullname },
    };
  } catch {
    return null;
  }
}
