import { getPool } from "@/lib/db";

export async function logAdminAction(userEmail: string, action: string, details: string) {
  await getPool().query(
    "insert into system_logs (user_email, action, details) values ($1, $2, $3)",
    [userEmail, action, details]
  );
}
