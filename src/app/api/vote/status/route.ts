import { getVotingOpen } from "@/lib/voting";

export async function GET() {
  const open = await getVotingOpen();
  return Response.json({ open });
}
