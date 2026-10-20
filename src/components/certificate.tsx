import svgSource from "./certificate-editable.svg?raw";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default function Certificate({
  recipient = "Full.Name",
  category = "Award Title",
}: {
  recipient?: string;
  category?: string;
}) {
  const markup = svgSource
    .replace(/(<text id="award-title"[^>]*>)[^<]*(<\/text>)/, `$1${escapeXml(category)}$2`)
    .replace(
      /(<text id="winner-name"[^>]*>)Winner: [^<]*(<\/text>)/,
      `$1Winner: ${escapeXml(recipient)}$2`,
    );

  return (
    <div
      className="certificate"
      // The SVG is a trusted, build-time asset; only the two editable text
      // nodes are swapped, and the injected values are XML-escaped above.
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
