import { randomBytes } from "node:crypto";
import { getPool } from "@/lib/db";

const CODE_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export type Certificate = {
  id: string;
  code: string;
  nominee_id: string;
  category_id: string;
  nominee_name: string;
  category_title: string;
  created_at: string;
};

function randomCode(length = 5) {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return out;
}

/**
 * Return the existing certificate for a nominee/category, or create a new one
 * with a fresh `bisbit26-xxxxx` verification code.
 */
export async function issueCertificate({
  nomineeId,
  categoryId,
  nomineeName,
  categoryTitle,
  createdBy,
}: {
  nomineeId: string;
  categoryId: string;
  nomineeName: string;
  categoryTitle: string;
  createdBy: string;
}): Promise<Certificate> {
  const pool = getPool();

  const existing = await pool.query<Certificate>(
    `select id, code, nominee_id, category_id, nominee_name, category_title, created_at
     from certificates
     where nominee_id = $1 and category_id = $2
     limit 1`,
    [nomineeId, categoryId]
  );
  if (existing.rows[0]) {
    return existing.rows[0];
  }

  for (let attempt = 0; attempt < 6; attempt++) {
    const code = `bisbit26-${randomCode()}`;
    try {
      const { rows } = await pool.query<Certificate>(
        `insert into certificates
           (code, nominee_id, category_id, nominee_name, category_title, created_by)
         values ($1, $2, $3, $4, $5, $6)
         returning id, code, nominee_id, category_id, nominee_name, category_title, created_at`,
        [code, nomineeId, categoryId, nomineeName, categoryTitle, createdBy]
      );
      return rows[0];
    } catch (error) {
      const code_ = (error as { code?: string }).code;
      // 23505 = unique_violation; retry on code clash or a concurrent insert.
      if (code_ !== "23505") throw error;
    }
  }

  throw new Error("Could not generate a unique certificate code");
}

export async function getCertificateByCode(code: string): Promise<Certificate | null> {
  const { rows } = await getPool().query<Certificate>(
    `select id, code, nominee_id, category_id, nominee_name, category_title, created_at
     from certificates
     where code = $1
     limit 1`,
    [code.trim().toLowerCase()]
  );
  return rows[0] ?? null;
}
