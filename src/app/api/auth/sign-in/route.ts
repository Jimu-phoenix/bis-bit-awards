import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/session";
import { findUserByEmail } from "@/lib/auth-server";
import { verifyPassword } from "@/lib/password";
import { isSecureRequest } from "@/lib/set-cookie";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    await createSession(user.id, isSecureRequest(request));

    return NextResponse.json({
      user: { id: String(user.id), email: user.email, fullname: user.fullname },
    });
  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json({ message: "Sign in failed" }, { status: 500 });
  }
}
