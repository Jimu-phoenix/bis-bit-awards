import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { VoteClient } from "./vote-client";

export const metadata: Metadata = {
  title: "Vote — Finale Awards",
  description: "Cast your vote for the Finale Awards — BIS / BIT Class of 2026.",
};

export const instant = false;

export default async function VotePage() {
  const session = await getSession();
  if (!session) redirect("/signin");

  return <VoteClient sessionKey={session.user.id} />;
}
