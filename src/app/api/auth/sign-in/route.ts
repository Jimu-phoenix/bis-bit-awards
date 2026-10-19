import { NextRequest, NextResponse } from "next/server";
import { forwardSetCookies } from "@/lib/set-cookie";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 });
    }

    const res = await fetch(`${process.env.NEON_AUTH_BASE_URL}/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: request.headers.get("Origin") ?? new URL(request.url).origin,
      },
      body: JSON.stringify({ email: email.toLowerCase(), password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    const response = NextResponse.json(data);
    forwardSetCookies(res.headers, response.headers);

    return response;
  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json({ message: "Sign in failed" }, { status: 500 });
  }
}
