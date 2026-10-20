"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPool } from "@/lib/db";
import { getSession } from "@/lib/auth-server";
import { getVotingOpen } from "@/lib/voting";

export type NominateResult =
  | { ok: true; message: "seed counted" | "created"; seed: number }
  | { ok: false; error: string };

export async function nominate(input: {
  categoryId: string;
  name: string;
  blurb?: string;
}): Promise<NominateResult> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { ok: false, error: "You must be signed in to nominate" };
  }

  const votingOpen = await getVotingOpen();
  if (votingOpen) {
    return { ok: false, error: "Cannot nominate when voting is open" };
  }

  const pool = getPool();
  const cleanName = input.name.trim();

  if (!cleanName) {
    return { ok: false, error: "Name is required" };
  }
  if (!input.categoryId) {
    return { ok: false, error: "Category is required" };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check if nominee already exists (case-insensitive, trimmed)
    const existing = await client.query<{
      id: string;
      seed: number;
    }>(
      `SELECT id, seed FROM nominees 
       WHERE category_id = $1 AND lower(trim(name)) = lower($2)
       LIMIT 1`,
      [input.categoryId, cleanName]
    );

    let seed: number;
    if (existing.rows[0]) {
      // Increment seed count
      seed = existing.rows[0].seed + 1;
      await client.query(
        `UPDATE nominees SET seed = $1 WHERE id = $2`,
        [seed, existing.rows[0].id]
      );
    } else {
      // Create new nominee with seed = 1
      seed = 1;
      await client.query(
        `INSERT INTO nominees (category_id, name, blurb, seed)
         VALUES ($1, $2, $3, $4)`,
      [input.categoryId, cleanName, input.blurb?.trim() ?? "", seed]
      );
    }

    await client.query("COMMIT");
    revalidatePath("/nominate");
    revalidatePath("/vote");

    return { ok: true, message: existing.rows[0] ? "seed counted" : "created", seed };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Nominate error:", error);
    return { ok: false, error: "Failed to submit nomination" };
  } finally {
    client.release();
  }
}

export async function submitNomination(formData: FormData) {
  const result = await nominate({
    categoryId: String(formData.get("categoryId") ?? ""),
    name: String(formData.get("name") ?? ""),
    blurb: String(formData.get("blurb") ?? ""),
  });

  if (!result.ok) {
    redirect(`/nominate?error=${encodeURIComponent(result.error)}`);
  }
  redirect(
    `/nominate?success=${encodeURIComponent(
      result.message === "seed counted"
        ? "Seed counted — their nomination is now stronger."
        : "Nomination submitted."
    )}`
  );
}