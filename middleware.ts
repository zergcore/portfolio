import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";
import { LATAM_COUNTRIES } from "@/lib/i18n/config";

// 💡 Strictly type Vercel's Edge properties to eliminate inline casting
interface VercelRequest extends NextRequest {
  geo?: {
    country?: string;
    city?: string;
    region?: string;
  };
}

const intlMiddleware = createMiddleware(routing);

/** 
 * Decodes JWT payload at the Edge to extract the 'exp' timestamp.
 * Uses robust try/catch to gracefully fail on malformed strings.
 */
function getTokenExpiry(token: string): number | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;

    // Edge-compatible base64 decoding
    const decoded = JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof decoded.exp === "number" ? decoded.exp : null;
  } catch {
    return null;
  }
}

function isTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  const exp = getTokenExpiry(token);
  // Compare current time (in seconds) to JWT exp signature
  return exp !== null && Date.now() / 1000 < exp;
}

export function middleware(req: VercelRequest) {
  const path = req.nextUrl.pathname;

  // 1. Static Asset Bypass
  // Acts as a failsafe against Vercel Edge Runtime routing quirks
  if (/\.\w+$/.test(path)) {
    return NextResponse.next();
  }

  // 2. Admin Portal Security Perimeter (Runs BEFORE locale handling)
  const isAdminRoute = path.startsWith("/admin");
  const isLoginRoute = path === "/admin/login";
  const token = req.cookies.get("admin_token")?.value;
  const tokenValid = isTokenValid(token);

  if (isAdminRoute) {
    if (!isLoginRoute && !tokenValid) {
      // Unauthenticated access to protected route: Redirect & purge stale cookie
      const res = NextResponse.redirect(new URL("/admin/login", req.url));
      res.cookies.delete("admin_token");
      return res;
    }

    if (isLoginRoute && tokenValid) {
      // Authenticated user hitting login page: Bounce to dashboard
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // Allow valid admin traffic through, bypassing i18n entirely
    return NextResponse.next();
  }

  // 3. API Route Bypass
  if (path.startsWith("/api")) {
    return NextResponse.next();
  }

  // 4. V2 Redesign Bypass — served outside the i18n locale tree
  if (path === "/v2" || path.startsWith("/v2/")) {
    return NextResponse.next();
  }

  // 5. Geo-IP Localization Routing (First-visit only)
  const hasLocalePrefix = routing.locales.some(
    (l) => path === `/${l}` || path.startsWith(`/${l}/`),
  );
  const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value;

  if (!hasLocalePrefix && !cookieLocale) {
    const country = req.geo?.country;
    const targetLocale = country && LATAM_COUNTRIES.has(country) ? "es" : "en";
    const destPath = path === "/" ? `/${targetLocale}` : `/${targetLocale}${path}`;

    return NextResponse.redirect(new URL(destPath, req.url));
  }

  // 6. Default next-intl processing
  return intlMiddleware(req);
}

export const config = {
  // Exclude Next.js internals and static files to save compute
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
