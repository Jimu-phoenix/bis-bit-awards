import { NextRequest, NextResponse } from "next/server";
import { forwardSetCookies } from "@/lib/set-cookie";

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("Cookie") || "";

    const res = await fetch(`${process.env.NEON_AUTH_BASE_URL}/sign-out`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: request.headers.get("Origin") ?? new URL(request.url).origin,
        Cookie: cookieHeader,
      },
      body: "{}",
    });

    const response = NextResponse.json({ ok: true });
    forwardSetCookies(res.headers, response.headers);
    if (res.headers.getSetCookie().length === 0) {
      response.headers.append(
        "Set-Cookie",
        "__Secure-neon-auth.session_token=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=None; Partitioned"
      );
    }

    return response;
  } catch (error) {
    console.error("Sign out error:", error);
    return NextResponse.json({ message: "Sign out failed" }, { status: 500 });
  }
}
