import type { Certificate } from "@/lib/certificates";

/**
 * Honorary awards sit outside the voting tables, so they are listed here.
 * The verify page checks this list as well as the database. To correct a
 * name, edit it here and redeploy; the code (and so the printed QR) stays.
 */
export const HONORARY: Certificate[] = [
  {
    id: "honorary-1",
    code: "bisbit26-7oca7",
    nominee_id: "",
    category_id: "",
    nominee_name: "PRINCE JIMU",
    category_title: "Dedication & Contribution to Technology",
    created_at: "2026-10-23T16:30:00.000Z",
  },
  {
    id: "honorary-2",
    code: "bisbit26-dizes",
    nominee_id: "",
    category_id: "",
    nominee_name: "UCHIZI KANYIMBO",
    category_title: "Distinguished Service Award",
    created_at: "2026-10-23T16:45:00.000Z",
  },
  {
    id: "honorary-3",
    code: "bisbit26-weem1",
    nominee_id: "",
    category_id: "",
    nominee_name: "DR. MARTIN BRIGHT MSENDEMA",
    category_title: "Inspirational Lecturer & Mentor Award",
    created_at: "2026-10-23T16:50:00.000Z",
  },
];

export function getHonoraryByCode(code: string): Certificate | null {
  const wanted = code.trim().toLowerCase();
  return HONORARY.find((h) => h.code === wanted) ?? null;
}
