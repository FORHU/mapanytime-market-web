import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hasSession = request.cookies.get("has_session");

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();

  // Keep protected pages out of the back/forward cache. Without this the browser can
  // repaint a fully rendered authenticated page from its own cache after logout — no
  // request is made, so neither this middleware nor the API ever gets a say.
  response.headers.set("Cache-Control", "no-store, must-revalidate");
  response.headers.set("Pragma", "no-cache");

  return response;
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
  matcher: [
    "/seller/:path*",
    "/admin/:path*",
    // Previously unlisted, so these got neither the signed-out redirect nor the
    // no-store header — /agent in particular had only a token-presence client gate.
    "/agent/:path*",
    "/buyer/:path*",
    "/checkout/:path*",
  ],
};
