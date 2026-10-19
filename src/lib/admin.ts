import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { getPool } from "@/lib/db";

export type AdminRecord = {
  id: number;
  email: string;
  fullname: string;
};

export async function findAdminByEmail(email: string): Promise<AdminRecord | null> {
  const { rows } = await getPool().query<AdminRecord>(
    "select id, email, fullname from admins where lower(trim(email)) = lower($1) limit 1",
    [email.trim()]
  );
  return rows[0] ?? null;
}

export async function requireAdminUser() {
  const session = await getSession();
  if (!session?.user?.email) {
    redirect("/signin");
  }

  const admin = await findAdminByEmail(session.user.email);
  if (!admin) {
    redirect("/vote");
  }

  return session.user;
}
