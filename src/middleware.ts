import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token =
    req.cookies.get("authjs.session-token")?.value ??
    req.cookies.get("__Secure-authjs.session-token")?.value;

  const isAdmin = pathname.startsWith("/admin");
  const isCaptain = pathname.startsWith("/mi-equipo");
  const isLoginPage = pathname === "/login";

  // Protected routes require auth
  if ((isAdmin || isCaptain) && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Already logged in? redirect away from login
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/mi-equipo/:path*", "/login"],
};
