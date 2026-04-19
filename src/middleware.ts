import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-secret-change-in-production"
);

const PUBLIC_PATHS = ["/login", "/register", "/apply", "/api/auth/login", "/api/auth/register", "/api/stripe/webhook"];
const ADMIN_PATHS = ["/admin", "/api/staff", "/api/bulk", "/api/late-fees", "/api/payment-adjustments"];
const STAFF_PATHS = ["/staff"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/sign/") ||
    pathname.startsWith("/_next") ||
    pathname === "/" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    const token = req.cookies.get("auth-token")?.value;
    if (!token) return NextResponse.next();

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.role as string;

      if (ADMIN_PATHS.some((p) => pathname.startsWith(p)) && role !== "ADMIN" && role !== "MANAGEMENT") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } catch {
      // Invalid token — allow request to proceed, API can handle auth
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
