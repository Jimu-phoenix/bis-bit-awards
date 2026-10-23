import svgSource from "./certificate-editable.svg?raw";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ---- Name block layout -----------------------------------------------------
// The name sits between the two braces on a fixed-width area, so it is fitted
// by choosing the number of lines and the font size (monospace: every glyph is
// ~0.6em wide). Only the look changes; the stored name, QR and code do not.
const NAME_X = 561.5;
const NAME_WIDTH = 540; // usable width between the braces
const NAME_TOP = 294; // just under "PRESENTED TO"
const NAME_BOTTOM = 392; // just above the class pill
const MAX_FONT = 54;
const GOOD_FONT = 40; // fewest lines that still reach this size win
const CHAR_W = 0.62; // slightly generous so print never clips
const LINE_H = 1.12;

/** Split a name into unbreakable pieces: comma-separated names, else words. */
function tokens(name: string): string[] {
  const parts = name.includes(",")
    ? name.split(",").map((p) => p.trim()).filter(Boolean).map((p, i, a) => (i < a.length - 1 ? `${p},` : p))
    : name.split(/\s+/).filter(Boolean);
  return parts.length ? parts : [name];
}

/** Best split of tokens into `lines` rows, minimising the longest row. */
function balance(parts: string[], lines: number): string[] {
  const n = parts.length;
  if (lines >= n) return parts;
  let best: string[] = [];
  let bestMax = Infinity;
  const walk = (start: number, left: number, acc: string[]) => {
    if (left === 1) {
      const row = parts.slice(start).join(" ");
      const rows = [...acc, row];
      const max = Math.max(...rows.map((r) => r.length));
      if (max < bestMax) {
        bestMax = max;
        best = rows;
      }
      return;
    }
    for (let end = start + 1; end <= n - left + 1; end++) {
      walk(end, left - 1, [...acc, parts.slice(start, end).join(" ")]);
    }
  };
  walk(0, lines, []);
  return best;
}

function layoutName(raw: string) {
  const name = raw.replace(/\s+/g, " ").trim() || "Full.Name";
  const parts = tokens(name);
  let chosen: { rows: string[]; font: number } | null = null;

  for (let lines = 1; lines <= Math.min(4, parts.length); lines++) {
    const rows = balance(parts, lines);
    const widest = Math.max(...rows.map((r) => r.length));
    const heightCap = (NAME_BOTTOM - NAME_TOP) / (0.75 + LINE_H * (lines - 1));
    const font = Math.min(MAX_FONT, NAME_WIDTH / (widest * CHAR_W), heightCap);
    if (!chosen || font > chosen.font) chosen = { rows, font };
    if (font >= GOOD_FONT) {
      chosen = { rows, font };
      break;
    }
  }
  // Single unbreakable token that is still too wide: just shrink it.
  const { rows, font } = chosen!;
  return { rows, font: Math.max(10, Math.floor(font * 10) / 10) };
}

function applyName(svg: string, recipient: string): string {
  const { rows, font } = layoutName(recipient);

  // Single line keeps the original geometry exactly.
  const single = rows.length === 1;
  const lineStep = font * LINE_H;
  const firstBase = single ? 356 : NAME_TOP + font * 0.75;
  const lastBase = firstBase + lineStep * (rows.length - 1);
  const underlineY = single ? 390 : Math.round(lastBase + font * 0.2 + 4);

  const spans = rows
    .map(
      (row, i) =>
        `<tspan x="${NAME_X}" y="${(firstBase + i * lineStep).toFixed(1)}">${escapeXml(row)}</tspan>`,
    )
    .join("");

  let out = svg.replace(
    /<text id="winner-name"([^>]*?)font-size="[\d.]+"([^>]*)>[^<]*<\/text>/,
    `<text id="winner-name"$1font-size="${font}"$2>${spans}</text>`,
  );

  if (!single) {
    // Braces grow to the height of the block; inner edges stay put.
    const braceSize = Math.round(lastBase + font * 0.25 - NAME_TOP + 6);
    const cy = (NAME_TOP + lastBase + font * 0.25) / 2;
    const braceBase = (cy + braceSize * 0.3).toFixed(1);
    out = out
      .replace(
        /<text id="brace-left" x="235" y="356"([^>]*?)font-size="72"/,
        `<text id="brace-left" x="278" y="${braceBase}" text-anchor="end"$1font-size="${braceSize}"`,
      )
      .replace(
        /<text id="brace-right" x="844" y="356"([^>]*?)font-size="72"/,
        `<text id="brace-right" x="844" y="${braceBase}"$1font-size="${braceSize}"`,
      )
      .replace(/(<rect id="name-underline" x="291" y=")390"/, `$1${underlineY}"`)
      .replace(/(<rect id="name-underline-end" x="822" y=")382"/, `$1${underlineY - 8}"`);
  }
  return out;
}

/** "23 / 10 / 2026, 07:19" in Malawi time, identical on server and client. */
function formatIssued(iso?: string): string {
  if (!iso) return "DD / MM / YYYY";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "DD / MM / YYYY";
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Blantyre",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  );
  return `${p.day} / ${p.month} / ${p.year}, ${p.hour}:${p.minute}`;
}

export default function Certificate({
  recipient = "Full.Name",
  category = "Award Title",
  verifyCode = "bisbit26-xxxxx",
  qrMarkup = "",
  issuedAt,
}: {
  recipient?: string;
  category?: string;
  verifyCode?: string;
  qrMarkup?: string;
  /** ISO timestamp the certificate was first issued (certificates.created_at). */
  issuedAt?: string;
}) {
  const markup = applyName(svgSource, recipient)
    .replace(/(<text id="award-title"[^>]*>)[^<]*(<\/text>)/, `$1${escapeXml(category)}$2`)
    .replace(
      /(<text id="date-placeholder"[^>]*>)[^<]*(<\/text>)/,
      `$1${escapeXml(formatIssued(issuedAt))}$2`,
    )
    .replace(
      /(<text id="verify-code"[^>]*>)[^<]*(<\/text>)/,
      `$1${escapeXml(verifyCode)}$2`,
    )
    .replace("<!--QR_CODE-->", qrMarkup);

  return (
    <div
      className="certificate"
      // The SVG is a trusted, build-time asset; only the editable text nodes
      // and the generated QR are swapped, and the injected values are
      // XML-escaped above.
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
