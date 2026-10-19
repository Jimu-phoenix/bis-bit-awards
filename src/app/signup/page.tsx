import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { SignUpForm } from "./sign-up-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Create Account — Finale Awards",
  description: "Create your Finale Awards account — BIS / BIT Class of 2026.",
};

export default async function SignUpPage() {
  const session = await getSession();
  if (session) redirect("/vote");

  return <SignUpForm />;
}
