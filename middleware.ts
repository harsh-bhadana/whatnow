import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnAuthRoute = req.nextUrl.pathname.startsWith('/auth');

  if (isOnAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/', req.nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && !req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/auth/signin', req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
