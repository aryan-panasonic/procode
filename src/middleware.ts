import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware({
  locales: ["en", "ja"],
  defaultLocale: "ja",
});

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "";

export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (isAdminPage || isAdminApi) {
    const cookieToken = req.cookies.get("admin_token")?.value;

    if (cookieToken === ADMIN_SECRET) {
      return NextResponse.next();
    }

    const queryToken = req.nextUrl.searchParams.get("token");

    if (queryToken === ADMIN_SECRET) {
      const response = NextResponse.redirect(
        new URL("/admin/analytics", req.url)
      );

      response.cookies.set("admin_token", ADMIN_SECRET, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 8,
        path: "/",
      });

      return response;
    }

    return new NextResponse("Unauthorized", {
      status: 401,
    });
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/",
    "/(en|ja)/:path*",
  ],
};  