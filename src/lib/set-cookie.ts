export type ParsedCookieOptions = {
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "strict" | "lax" | "none";
  partitioned?: boolean;
};

export type ParsedCookie = {
  name: string;
  value: string;
  options: ParsedCookieOptions;
};

function parseSingleCookie(cookieStr: string): ParsedCookie {
  const [first, ...rest] = cookieStr.split(";");
  const eq = first.indexOf("=");
  const name = (eq === -1 ? first : first.slice(0, eq)).trim();
  const value = (eq === -1 ? "" : first.slice(eq + 1)).trim();
  const options: ParsedCookieOptions = {};

  for (const attr of rest) {
    const attrStr = attr.trim();
    const attrEq = attrStr.indexOf("=");
    const key = (attrEq === -1 ? attrStr : attrStr.slice(0, attrEq)).trim().toLowerCase();
    const val = attrEq === -1 ? "" : attrStr.slice(attrEq + 1).trim();

    switch (key) {
      case "max-age":
        options.maxAge = parseInt(val, 10);
        break;
      case "expires": {
        const expires = new Date(val);
        if (!Number.isNaN(expires.getTime())) options.expires = expires;
        break;
      }
      case "path":
        options.path = val;
        break;
      case "domain":
        options.domain = val;
        break;
      case "secure":
        options.secure = true;
        break;
      case "httponly":
        options.httpOnly = true;
        break;
      case "samesite": {
        const sameSite = val.toLowerCase();
        if (sameSite === "strict" || sameSite === "lax" || sameSite === "none") {
          options.sameSite = sameSite;
        }
        break;
      }
      case "partitioned":
        options.partitioned = true;
        break;
    }
  }

  return { name, value, options };
}

export function parseSetCookieHeader(header: string): ParsedCookie[] {
  if (!header) return [];
  // Split on commas that separate cookies, but not commas inside Expires dates.
  return header.split(/,(?=\s*[^;,\s]+=)/).map(parseSingleCookie);
}

/**
 * Copy Set-Cookie headers from one Headers object to another verbatim.
 * Never round-trip cookie values through an encoder — session tokens are
 * percent-encoded and re-encoding them corrupts the value.
 */
export function forwardSetCookies(source: Headers, target: Headers): void {
  const raw = typeof source.getSetCookie === "function" ? source.getSetCookie() : [];
  if (raw.length > 0) {
    for (const cookie of raw) {
      target.append("Set-Cookie", cookie);
    }
    return;
  }
  const combined = source.get("Set-Cookie");
  if (combined) {
    target.append("Set-Cookie", combined);
  }
}
