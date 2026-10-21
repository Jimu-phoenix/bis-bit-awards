"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPool } from "@/lib/db";
import { requireAdminUser } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";
import { setVotingOpen } from "@/lib/voting";
import { issueCertificate } from "@/lib/certificates";
import { verifyUrlFor, qrSvgAt, QR_BOX } from "@/lib/qr";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function number(formData: FormData, key: string) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : 0;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fail(path: string, message: string) {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function done(path: string, message: string) {
  revalidatePath("/admin", "layout");
  redirect(`${path}?saved=${encodeURIComponent(message)}`);
}

async function uniqueCategorySlug(base: string, excludeId?: string) {
  const pool = getPool();
  const root = base || "category";
  let candidate = root;
  let n = 1;

  for (;;) {
    const { rows } = await pool.query("select id from categories where slug = $1", [candidate]);
    if (rows.length === 0 || (excludeId && String(rows[0].id) === excludeId)) {
      return candidate;
    }
    n += 1;
    candidate = `${root}-${n}`;
  }
}

export async function createCategory(formData: FormData) {
  const user = await requireAdminUser();
  const title = text(formData, "title");
  const blurb = text(formData, "blurb");
  const sortOrder = number(formData, "sort_order");

  if (!title) {
    fail("/admin/categories", "A category title is required");
  }

  const slug = await uniqueCategorySlug(slugify(title));
  const { rows } = await getPool().query<{ id: string }>(
    `insert into categories (slug, title, blurb, sort_order)
     values ($1, $2, $3, $4) returning id`,
    [slug, title, blurb, sortOrder]
  );

  await logAdminAction(
    user.email,
    "category.create",
    `Created category "${title}" (slug: ${slug}, id: ${rows[0].id})`
  );

  done("/admin/categories", `Category "${title}" created`);
}

export async function updateCategory(formData: FormData) {
  const user = await requireAdminUser();
  const id = text(formData, "id");
  const title = text(formData, "title");
  const blurb = text(formData, "blurb");
  const sortOrder = number(formData, "sort_order");

  if (!id || !title) {
    fail("/admin/categories", "A category title is required");
  }

  const { rowCount } = await getPool().query(
    "update categories set title = $1, blurb = $2, sort_order = $3 where id = $4",
    [title, blurb, sortOrder, id]
  );

  if (rowCount === 0) {
    fail("/admin/categories", "Category not found");
  }

  await logAdminAction(user.email, "category.update", `Updated category #${id} to "${title}"`);
  done("/admin/categories", `Category "${title}" updated`);
}

export async function deleteCategory(formData: FormData) {
  const user = await requireAdminUser();
  const id = text(formData, "id");
  if (!id) {
    fail("/admin/categories", "Category id missing");
  }

  const { rows } = await getPool().query<{ title: string }>(
    "delete from categories where id = $1 returning title",
    [id]
  );

  if (rows.length === 0) {
    fail("/admin/categories", "Category not found");
  }

  await logAdminAction(
    user.email,
    "category.delete",
    `Deleted category "${rows[0].title}" (#${id}) and its nominees and votes`
  );
  done("/admin/categories", `Category "${rows[0].title}" deleted`);
}

export async function createNominee(formData: FormData) {
  const user = await requireAdminUser();
  const name = text(formData, "name");
  const categoryId = text(formData, "category_id");
  const blurb = text(formData, "blurb");
  const seed = number(formData, "seed");

  if (!name || !categoryId) {
    fail("/admin/nominees", "A nominee name and category are required");
  }

  const { rows } = await getPool().query<{ id: string }>(
    `insert into nominees (category_id, name, blurb, seed)
     values ($1, $2, $3, $4) returning id`,
    [categoryId, name, blurb, seed]
  );

  await logAdminAction(
    user.email,
    "nominee.create",
    `Created nominee "${name}" (#${rows[0].id}) in category #${categoryId}`
  );

  done("/admin/nominees", `Nominee "${name}" created`);
}

export async function updateNominee(formData: FormData) {
  const user = await requireAdminUser();
  const id = text(formData, "id");
  const name = text(formData, "name");
  const categoryId = text(formData, "category_id");
  const blurb = text(formData, "blurb");
  const seed = number(formData, "seed");

  if (!id || !name || !categoryId) {
    fail("/admin/nominees", "A nominee name and category are required");
  }

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check if another nominee with the same name exists in the category
    const existing = await client.query<{ id: string }>(
      `select id from nominees where category_id = $1 and lower(trim(name)) = lower($2) and id <> $3 limit 1`,
      [categoryId, name, id]
    );
    if (existing.rows[0]) {
      fail("/admin/nominees", "A nominee with this name already exists in this category");
    }

    const { rowCount } = await client.query(
      `update nominees set name = $1, category_id = $2, blurb = $3, seed = $4 where id = $5`,
      [name, categoryId, blurb, seed, id]
    );

    if (rowCount === 0) {
      fail("/admin/nominees", "Nominee not found");
    }

    await client.query("COMMIT");

    await logAdminAction(
      user.email,
      "nominee.update",
      `Updated nominee #${id} to "${name}" (category #${categoryId})`
    );
    done("/admin/nominees", `Nominee "${name}" updated`);
  } catch (error) {
    await client.query("ROLLBACK");
    // Check for unique constraint violation (code 23505)
    if ((error as { code?: string }).code === "23505") {
      fail("/admin/nominees", "A nominee with this name already exists in this category");
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteNominee(formData: FormData) {
  const user = await requireAdminUser();
  const id = text(formData, "id");
  if (!id) {
    fail("/admin/nominees", "Nominee id missing");
  }

  const { rows } = await getPool().query<{ name: string }>(
    "delete from nominees where id = $1 returning name",
    [id]
  );

  if (rows.length === 0) {
    fail("/admin/nominees", "Nominee not found");
  }

  await logAdminAction(
    user.email,
    "nominee.delete",
    `Deleted nominee "${rows[0].name}" (#${id}) and its votes`
  );
  done("/admin/nominees", `Nominee "${rows[0].name}" deleted`);
}

export async function grantAdmin(formData: FormData) {
  const user = await requireAdminUser();
  const email = text(formData, "email").toLowerCase();
  const fullname = text(formData, "fullname");

  if (!email) {
    fail("/admin/users", "An email address is required");
  }

  const existing = await getPool().query("select 1 from admins where lower(trim(email)) = $1", [
    email,
  ]);
  if (existing.rows.length > 0) {
    fail("/admin/users", `${email} is already an admin`);
  }

  await getPool().query("insert into admins (email, fullname) values ($1, $2)", [email, fullname]);
  await logAdminAction(user.email, "admin.grant", `Granted dashboard access to ${email}`);
  done("/admin/users", `${email} can now access the dashboard`);
}

export async function toggleVoting(formData: FormData) {
  const user = await requireAdminUser();
  const open = text(formData, "open") === "true";
  const requestedPath = text(formData, "path");
  const path =
    requestedPath.startsWith("/admin") && !requestedPath.startsWith("//")
      ? requestedPath
      : "/admin";

  await setVotingOpen(open, user.email);
  await logAdminAction(
    user.email,
    open ? "voting.open" : "voting.close",
    open ? "Voting period opened" : "Voting period closed"
  );
  done(path, open ? "Voting is now active" : "Voting period closed");
}

export async function revokeAdmin(formData: FormData) {
  const user = await requireAdminUser();
  const email = text(formData, "email").toLowerCase();

  if (!email) {
    fail("/admin/users", "An email address is required");
  }

  if (email === user.email.toLowerCase()) {
    fail("/admin/users", "You cannot revoke your own dashboard access");
  }

  const { rowCount } = await getPool().query(
    "delete from admins where lower(trim(email)) = $1",
    [email]
  );

  if (rowCount === 0) {
    fail("/admin/users", "Admin not found");
  }

  await logAdminAction(user.email, "admin.revoke", `Revoked dashboard access from ${email}`);
  done("/admin/users", `Revoked dashboard access from ${email}`);
}

/**
 * Issue (or reuse) a certificate for the winning nominee of a category and
 * return its verification code + QR-ready URL. Called from the admin "Print
 * winner" button before the certificate is rendered and printed.
 */
export async function createCertificate(input: {
  nomineeId: string;
  categoryId: string;
  nomineeName: string;
  categoryTitle: string;
}): Promise<{ code: string; verifyUrl: string; qrMarkup: string }> {
  const user = await requireAdminUser();

  const certificate = await issueCertificate({
    nomineeId: input.nomineeId,
    categoryId: input.categoryId,
    nomineeName: input.nomineeName,
    categoryTitle: input.categoryTitle,
    createdBy: user.email,
  });

  await logAdminAction(
    user.email,
    "certificate.issue",
    `Issued certificate ${certificate.code} for "${certificate.nominee_name}" (${certificate.category_title})`
  );

  const verifyUrl = verifyUrlFor(certificate.code);
  const qrMarkup = await qrSvgAt(verifyUrl, QR_BOX);

  return { code: certificate.code, verifyUrl, qrMarkup };
}
