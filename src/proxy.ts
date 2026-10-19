import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getPool } from "@/lib/db";

const PUBLIC_ROUTES = ["/", "/signin", "/signup", "/api/vote/totals", "/api/auth"];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

function isAdminRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function redirectToSignIn(request: NextRequest, pathname: string, clearCookies: boolean) {
  const signInUrl = new URL("/signin", request.url);
  signInUrl.searchParams.set("callbackUrl", pathname);
  const response = NextResponse.redirect(signInUrl);
  if (clearCookies) {
    response.cookies.delete("__Secure-neon-auth.session_token");
    response.cookies.delete("__Secure-neon-auth.local.session_data");
    response.cookies.delete("__Secure-neon-auth.session_challenge");
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("__Secure-neon-auth.session_token");
  if (!sessionCookie) {
    return redirectToSignIn(request, pathname, false);
  }

  const authBaseUrl = process.env.NEON_AUTH_BASE_URL;
  if (!authBaseUrl) {
    console.warn("NEON_AUTH_BASE_URL not set, allowing request");
    return NextResponse.next();
  }

  let userEmail: string | undefined;
  try {
    const response = await fetch(`${authBaseUrl}/get-session`, {
      headers: { Cookie: request.headers.get("Cookie") || "" },
    });
    if (response.ok) {
      const data = await response.json();
      userEmail = data?.user?.email;
    }
  } catch (error) {
    console.error("Auth validation error:", error);
    return NextResponse.next();
  }

  if (!userEmail) {
    return redirectToSignIn(request, pathname, true);
  }

  if (isAdminRoute(pathname)) {
    try {
      const { rows } = await getPool().query(
        "select 1 from admins where lower(trim(email)) = lower($1) limit 1",
        [userEmail]
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
  matcher: ["/vote/:path*", "/admin/:path*"],
};
