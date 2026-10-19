import { NextRequest, NextResponse } from "next/server";
import { forwardSetCookies } from "@/lib/set-cookie";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 });
    }

    const pattern = /^(bis|bit)2[12]-[a-z0-9._-]+@mubas\.ac\.mw$/i;
    if (!pattern.test(email.toLowerCase())) {
      return NextResponse.json(
        { message: "Invalid email format. Use bis21-name@mubas.ac.mw or bit22-name@mubas.ac.mw" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 });
    }

    const res = await fetch(`${process.env.NEON_AUTH_BASE_URL}/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: request.headers.get("Origin") ?? new URL(request.url).origin,
      },
      body: JSON.stringify({
        email: email.toLowerCase(),
        password,
        name: typeof body.name === "string" && body.name.trim() ? body.name.trim() : email.split("@")[0],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    const response = NextResponse.json(data);
    forwardSetCookies(res.headers, response.headers);

    return response;
  } catch (error) {
    console.error("Sign up error:", error);
    return NextResponse.json({ message: "Sign up failed" }, { status: 500 });
  }
}
