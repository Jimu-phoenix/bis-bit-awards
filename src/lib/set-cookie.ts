/**
 * Whether the incoming request reached the app over HTTPS. Honors a reverse
 * proxy's `x-forwarded-proto` header (Vercel/Neon hosting) and falls back to
 * the request URL protocol for local dev. Used to decide whether the session
 * cookie should carry the `Secure` attribute.
 */
export function isSecureRequest(request: {
  url: string;
  headers: { get(name: string): string | null };
}): boolean {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0].trim().toLowerCase() === "https";
  return new URL(request.url).protocol === "https:";
}
