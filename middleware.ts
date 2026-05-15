import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";
import { LATAM_COUNTRIES } from "@/lib/i18n/config";

const intlMiddleware = createMiddleware(routing);

/** Decode JWT payload and return the exp unix timestamp, or null if invalid/missing. */
function getTokenExpiry(token: string): number | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const decoded = JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof decoded.exp === "number" ? decoded.exp : null;
  } catch {
    return null;
  }
}

function isTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  const exp = getTokenExpiry(token);
  return exp !== null && Date.now() / 1000 < exp;
}

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Admin auth — runs before locale handling
  if (path.startsWith("/admin") && path !== "/admin/login") {
    const token = req.cookies.get("admin_token")?.value;
    if (!isTokenValid(token)) {
      const res = NextResponse.redirect(new URL("/admin/login", req.url));
      // Clear a stale/expired cookie so the login page doesn't see it
      res.cookies.delete("admin_token");
      return res;
    }
  }
  if (path === "/admin/login") {
    const token = req.cookies.get("admin_token")?.value;
    if (isTokenValid(token)) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // Admin and API routes bypass locale middleware entirely
  if (path.startsWith("/admin") || path.startsWith("/api")) {
    return NextResponse.next();
  }

  // First-visit geo detection: no NEXT_LOCALE cookie and no locale prefix → redirect
  const hasLocalePrefix = routing.locales.some(
    (l) => path === `/${l}` || path.startsWith(`/${l}/`),
  );
  const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value;

  if (!hasLocalePrefix && !cookieLocale) {
    // Vercel injects geo at the edge; type is not in NextRequest by default
    const country = (req as NextRequest & { geo?: { country?: string } }).geo
      ?.country;
    const target = country && LATAM_COUNTRIES.has(country) ? "es" : "en";
    const dest = path === "/" ? `/${target}` : `/${target}${path}`;
    return NextResponse.redirect(new URL(dest, req.url));
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
