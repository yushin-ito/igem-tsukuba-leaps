import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isAuth = !!req.auth?.user;
  const isAuthPage =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/signup");

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/project", req.url));
    }

    return NextResponse.next();
  }

  if (!isAuth) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, req.url),
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/project/:path*", "/login", "/signup"],
};
