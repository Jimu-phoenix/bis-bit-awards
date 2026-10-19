import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/session";
import { createUser, findUserByEmail } from "@/lib/auth-server";
import { isSecureRequest } from "@/lib/set-cookie";

const EMAIL_PATTERN = /^(bis|bit)2[12]-[a-z0-9._-]+@mubas\.ac\.mw$/i;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const fullname =
      typeof body.fullname === "string" && body.fullname.trim()
        ? body.fullname.trim()
        : typeof body.name === "string" && body.name.trim()
          ? body.name.trim()
          : email.split("@")[0];

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 });
    }

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format. Use bis21-name@mubas.ac.mw or bit22-name@mubas.ac.mw" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ message: "An account with this email already exists" }, { status: 409 });
    }

    const user = await createUser({ email, fullname, password });
    await createSession(user.id, isSecureRequest(request));

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Sign up error:", error);
    return NextResponse.json({ message: "Sign up failed" }, { status: 500 });
  }
}
