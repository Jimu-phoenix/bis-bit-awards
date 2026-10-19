import { NextRequest, NextResponse } from "next/server";
import { forwardSetCookies } from "@/lib/set-cookie";

export async function POST(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const path = pathname.replace("/api/auth/", "");

    const res = await fetch(`${process.env.NEON_AUTH_BASE_URL}/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: request.headers.get("Origin") ?? new URL(request.url).origin,
        Cookie: request.headers.get("Cookie") || "",
      },
      body: request.body,
    });

    const data = await res.json();

    const response = NextResponse.json(data);
    forwardSetCookies(res.headers, response.headers);

    return response;
  } catch (error) {
    console.error("Auth proxy error:", error);
    return NextResponse.json({ message: "Auth request failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const path = pathname.replace("/api/auth/", "");

    const res = await fetch(`${process.env.NEON_AUTH_BASE_URL}/${path}`, {
      method: "GET",
      headers: {
        Cookie: request.headers.get("Cookie") || "",
      },
    });

    const data = await res.json();

    const response = NextResponse.json(data);
    forwardSetCookies(res.headers, response.headers);

    return response;
  } catch (error) {
    console.error("Auth proxy error:", error);
    return NextResponse.json({ message: "Auth request failed" }, { status: 500 });
  }
}
