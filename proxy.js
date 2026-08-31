import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // 1. CRITICAL: Skip middleware logic for static assets, auth internal routes, and the error page
  if (
    pathname.startsWith("/_next") || 
    pathname.startsWith("/api/auth") || 
    pathname === "/auth/error" ||
    pathname.includes("favicon.ico")
  ) {
    return NextResponse.next();
  }

  const publicPaths = ["/", "/signin", "/signup", "/auth/error","/helpdesk"];
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  /* ---------- INSTANT BLOCK/DELETE CHECK ---------- */
  // We only check status for non-API, non-static requests where a token exists
  if (token && !pathname.startsWith("/api")) {
    try {
      const baseUrl = request.nextUrl.origin;
      
      // Use a timestamp to prevent cached responses
      const statusRes = await fetch(
        `${baseUrl}/api/user/status?id=${token.id || token.sub}&t=${Date.now()}`, 
        {
          cache: 'no-store',
          headers: { 
            'Accept': 'application/json',
            'Pragma': 'no-cache' 
          }
        }
      );

      // Check if the response is actually JSON before parsing
      const contentType = statusRes.headers.get("content-type");
      if (statusRes.ok && contentType && contentType.includes("application/json")) {
        const userData = await statusRes.json();

        if (userData.status === "blocked" || userData.status === "deleted") {
          const errorType = userData.status === "deleted" 
            ? "USER_DELETED" 
            : "ACCESS_DENIED_BLOCKED";

          const response = NextResponse.redirect(
            new URL(`/auth/error?error=${errorType}`, request.url)
          );

          // Force cookie clearing on all domains/paths
          const cookieOptions = { maxAge: 0, path: "/" };
          response.cookies.set("next-auth.session-token", "", cookieOptions);
          response.cookies.set("__Secure-next-auth.session-token", "", cookieOptions);
          
          // Prevent browser from caching the redirect
          response.headers.set("Cache-Control", "no-store, max-age=0");

          return response;
        }
      }
    } catch (error) {
      // Log the error but allow the request to proceed to avoid "Blackout" on API failures
      console.error("Middleware Status Check Failed:", error.message);
    }
  }

  /* ---------- 2. ONBOARDING ENFORCEMENT (NEW) ---------- */
  // If user is logged in and pending, they MUST stay on /onboarding
  if (token && token.onboardingStatus === "pending") {
    if (pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
    return NextResponse.next(); // Allow them to stay on /onboarding
  }

  /* ---------- REDIRECT LOGIC ---------- */
  
  // Not logged in -> Private page
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // Logged in -> Auth pages (signin/signup)
  if (token && (pathname === "/signin" || pathname === "/signup")) {
    const roleRedirect = token.role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(roleRedirect, request.url));
  }

  return NextResponse.next();
}

// 2. MATCHER CONFIG: Excludes API, Static, and Image folders from Middleware interception
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};