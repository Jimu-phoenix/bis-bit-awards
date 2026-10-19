import { getPool } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export type AuthUser = {
  id: string;
  email: string;
  fullname: string;
};

export type AuthSession = {
  id: string;
  user: AuthUser;
};

export { getSession, destroyCurrentSession as signOut } from "@/lib/session";

export async function findUserByEmail(
  email: string
): Promise<{ id: string; email: string; fullname: string; password_hash: string } | null> {
  const { rows } = await getPool().query<{
    id: string;
    email: string;
    fullname: string;
    password_hash: string;
  }>(
    `select id, email, fullname, password_hash
     from users
     where lower(email) = lower($1)
     limit 1`,
    [email.trim()]
  );
  return rows[0] ?? null;
}

export async function createUser(input: {
  email: string;
  fullname: string;
  password: string;
}): Promise<AuthUser> {
  const passwordHash = await hashPassword(input.password);
  const { rows } = await getPool().query<{ id: string; email: string; fullname: string }>(
    `insert into users (email, fullname, password_hash)
     values ($1, $2, $3)
     returning id, email, fullname`,
    [input.email.trim().toLowerCase(), input.fullname.trim(), passwordHash]
  );
  const row = rows[0];
  return { id: String(row.id), email: row.email, fullname: row.fullname };
}
