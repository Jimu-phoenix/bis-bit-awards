import type { Metadata } from "next";
import { VoteClient } from "./vote-client";

export const metadata: Metadata = {
  title: "Vote — Finale Awards",
  description: "Cast your vote for the Finale Awards — BIS / BIT Class of 2026.",
};

export default function VotePage() {
  return <VoteClient />;
}