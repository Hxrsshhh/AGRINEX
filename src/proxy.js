import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const DASHBOARDS = { FARMER: "/farmer/dashboard", OFFICER: "/officer/dashboard", ADMIN: "/admin/dashboard" };
const matchPath = (pathname, base) => pathname === base || pathname.startsWith(`${base}/`);

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes("favicon.ico")) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const role = token?.role;
  const getUrl = (path) => new URL(path, request.url);
  const fallbackRedirect = getUrl(DASHBOARDS[role] || "/signin");

  const isPublicPath = ["/", "/signin", "/signup", "/auth/error"].some((path) => matchPath(pathname, path));

  if (!token) {
    return isPublicPath ? NextResponse.next() : NextResponse.redirect(getUrl("/signin"));
  }

  const farmerVerified = role === "FARMER" && (token?.isVerified === true || token?.verification?.isVerified === true);

  if (matchPath(pathname, "/waiting-verification")) {
    if (role !== "FARMER") return NextResponse.redirect(fallbackRedirect);
    if (farmerVerified) return NextResponse.redirect(getUrl(DASHBOARDS.FARMER));
    return NextResponse.next();
  }

  if (role === "FARMER") {
    if (matchPath(pathname, "/onboarding")) return NextResponse.next();
    if (!farmerVerified) return NextResponse.redirect(getUrl("/waiting-verification"));
  }

  if (pathname === "/signin" || pathname === "/signup") {
    return NextResponse.redirect(fallbackRedirect);
  }

  if (matchPath(pathname, "/farmer")) {
    return role === "FARMER" ? NextResponse.next() : NextResponse.redirect(fallbackRedirect);
  }

  if (matchPath(pathname, "/officer")) {
    return role === "OFFICER" || role === "ADMIN" ? NextResponse.next() : NextResponse.redirect(fallbackRedirect);
  }

  if (matchPath(pathname, "/admin")) {
    return role === "ADMIN" ? NextResponse.next() : NextResponse.redirect(fallbackRedirect);
  }

  if (matchPath(pathname, "/onboarding")) {
    return role === "FARMER" ? NextResponse.next() : NextResponse.redirect(fallbackRedirect);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};