import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getPool } from "@/lib/db";
import { SESSION_COOKIE, resolveSession } from "@/lib/session";

const PUBLIC_ROUTES = ["/", "/verify", "/api/vote/totals", "/api/auth", "/api/session"];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

function isAdminRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function redirectToSignIn(request: NextRequest, pathname: string) {
  const signInUrl = new URL("/signin", request.url);
  signInUrl.searchParams.set("callbackUrl", pathname);
  const response = NextResponse.redirect(signInUrl);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return redirectToSignIn(request, pathname);
  }

  let session;
  try {
    session = await resolveSession(token);
  } catch (error) {
    console.error("Session lookup error:", error);
    return NextResponse.next();
  }

  if (!session) {
    return redirectToSignIn(request, pathname);
  }

  if (isAdminRoute(pathname)) {
    try {
      const { rows } = await getPool().query(
        "select 1 from admins where lower(trim(email)) = lower($1) limit 1",
        [session.user.email]
      );
      if (rows.length === 0) {
        return NextResponse.redirect(new URL("/vote", request.url));
      }
    } catch (error) {
      console.error("Admin role check error:", error);
      return NextResponse.redirect(new URL("/vote", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/vote/:path*", "/admin/:path*", "/verify/:path*"],
};
