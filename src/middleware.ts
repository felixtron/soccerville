import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token =
    req.cookies.get("authjs.session-token")?.value ??
    req.cookies.get("__Secure-authjs.session-token")?.value;

  const isAdmin = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/login";

  if (isAdmin && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
