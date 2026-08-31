import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // ==========================================
  // 1. SKIP STATIC / INTERNAL ROUTES
  // ==========================================

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes("favicon.ico")
  ) {
    return NextResponse.next();
  }

  // ==========================================
  // 2. GET NEXTAUTH TOKEN
  // ==========================================

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ==========================================
  // 3. PUBLIC ROUTES
  // ==========================================

  const publicPaths = [
    "/",
    "/signin",
    "/signup",
    "/auth/error",
    "/helpdesk",
  ];

  const isPublicPath = publicPaths.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(`${path}/`)
  );

  // ==========================================
  // 4. NOT LOGGED IN
  // ==========================================

  if (!token && !isPublicPath) {
    return NextResponse.redirect(
      new URL("/signin", request.url)
    );
  }

  // ==========================================
  // 5. LOGGED IN USER
  // ==========================================

  if (token) {
    const role = token.role;

    // ------------------------------------------
    // AUTH PAGES
    // ------------------------------------------

    if (
      pathname === "/signin" ||
      pathname === "/signup"
    ) {
      if (role === "FARMER") {
        return NextResponse.redirect(
          new URL("/farmer/dashboard", request.url)
        );
      }

      if (role === "OFFICER") {
        return NextResponse.redirect(
          new URL("/officer/dashboard", request.url)
        );
      }

      if (role === "ADMIN") {
        return NextResponse.redirect(
          new URL("/admin/dashboard", request.url)
        );
      }
    }

    // ------------------------------------------
    // FARMER ACCESS
    // ------------------------------------------

    if (pathname.startsWith("/farmer")) {
      if (role !== "FARMER") {
        if (role === "OFFICER") {
          return NextResponse.redirect(
            new URL(
              "/officer/dashboard",
              request.url
            )
          );
        }

        if (role === "ADMIN") {
          return NextResponse.redirect(
            new URL(
              "/admin/dashboard",
              request.url
            )
          );
        }

        return NextResponse.redirect(
          new URL("/signin", request.url)
        );
      }
    }

    // ------------------------------------------
    // OFFICER ACCESS
    // ------------------------------------------

    if (pathname.startsWith("/officer")) {
      if (
        role !== "OFFICER" &&
        role !== "ADMIN"
      ) {
        if (role === "FARMER") {
          return NextResponse.redirect(
            new URL(
              "/farmer/dashboard",
              request.url
            )
          );
        }

        return NextResponse.redirect(
          new URL("/signin", request.url)
        );
      }
    }

    // ------------------------------------------
    // ADMIN ACCESS
    // ------------------------------------------

    if (pathname.startsWith("/admin")) {
      if (role !== "ADMIN") {
        if (role === "FARMER") {
          return NextResponse.redirect(
            new URL(
              "/farmer/dashboard",
              request.url
            )
          );
        }

        if (role === "OFFICER") {
          return NextResponse.redirect(
            new URL(
              "/officer/dashboard",
              request.url
            )
          );
        }

        return NextResponse.redirect(
          new URL("/signin", request.url)
        );
      }
    }
  }

  return NextResponse.next();
}

// ==========================================
// MATCHER
// ==========================================

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};