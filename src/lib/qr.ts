import QRCode from "qrcode";

export const VERIFY_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ||
  "https://bis-bit-awards.vercel.app";

/** Where the QR sits on the certificate SVG (matches `#verify-qr-frame`). */
export const QR_BOX = { x: 880, y: 626, size: 90 };

export function verifyUrlFor(code: string) {
  return `${VERIFY_BASE_URL}/verify/${encodeURIComponent(code)}`;
}

/**
 * Render a QR code for the given text as an inline SVG string.
 * The result is a standalone `<svg>` sized to `size`px.
 */
export async function qrSvg(text: string, size = 200): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 0,
    width: size,
    color: { dark: "#0B1220", light: "#FFFFFF" },
  });
}

/**
 * Build a nested `<svg>` QR code positioned at (x, y) with the given size,
 * ready to be embedded inside the certificate SVG.
 */
export async function qrSvgAt(
  text: string,
  { x, y, size }: { x: number; y: number; size: number }
): Promise<string> {
  const qr = await qrSvg(text, size);
  const viewBox = qr.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 33 33";
  const paths = qr.match(/<path[^>]*\/>/g) ?? [];
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${viewBox}" shape-rendering="crispEdges">${paths.join("")}</svg>`;
}
