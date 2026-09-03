import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hasSession = request.cookies.get("has_session");

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// `has_session` is a non-httpOnly marker cookie and the JWT itself lives in sessionStorage, which
// middleware cannot read. So this is a first-hop redirect for signed-out visitors, NOT an
// authorization check — it cannot tell a buyer from an admin, and the cookie is trivially forged.
//
// Cookies are shared across tabs but sessionStorage is not, so a second tab can pass this check
// with no token behind it. The first API call 401s and fetcher redirects to /login, which is the
// intended outcome — just reached one hop later than it looks.
// Role gating for /admin lives in AdminAuthGate, and real enforcement is requireAdmin on the API.
export const config = {
  matcher: ["/seller/:path*", "/admin/:path*"],
};
