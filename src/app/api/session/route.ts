import { getSession } from "@/lib/auth-server";

export const instant = false;

export async function GET() {
  const session = await getSession();
  return Response.json(
    { user: session?.user ?? null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
