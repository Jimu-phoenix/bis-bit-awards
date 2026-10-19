import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { SignInForm } from "./sign-in-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Sign In — Finale Awards",
  description: "Sign in to the Finale Awards — BIS / BIT Class of 2026.",
};

export default async function SignInPage() {
  const session = await getSession();
  if (session) redirect("/vote");

  return <SignInForm />;
}
