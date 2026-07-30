import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const intlMiddleware = createMiddleware(routing);

const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET);

const PUBLIC_PATHS = ["/auth/login", "/auth/register", "/onboarding", "/offline"];

const PROTECTED_PREFIXES = ["/dashboard", "/learn", "/shop", "/inventory", "/social", "/settings", "/skill-tree", "/profile", "/admin"];

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
  const pathWithoutLocale = localeMatch ? pathname.slice(3) : pathname;

  if (PUBLIC_PATHS.some((p) => pathWithoutLocale.startsWith(p))) {
    return intlMiddleware(request);
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathWithoutLocale.startsWith(p));

  if (isProtected) {
    const sessionToken =
      request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!sessionToken) {
      const url = request.nextUrl.clone();
      url.pathname = `/${localeMatch?.[1] || "pt"}/auth/login`;
      return NextResponse.redirect(url);
    }

    try {
      const { payload } = await jwtVerify(sessionToken, JWT_SECRET);

      if (pathWithoutLocale.startsWith("/admin")) {
        const role = payload.role as string | undefined;
        if (!role || role !== "ADMIN") {
          const url = request.nextUrl.clone();
          url.pathname = `/${localeMatch?.[1] || "pt"}/dashboard`;
          return NextResponse.redirect(url);
        }
      }
    } catch {
      const url = request.nextUrl.clone();
      url.pathname = `/${localeMatch?.[1] || "pt"}/auth/login`;
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_next/static|_next/image|favicon.ico).*)"],
};
