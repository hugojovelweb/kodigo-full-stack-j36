import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy (antes "middleware") de Next.js 16.
 * Primera barrera: redirige si no hay cookie de sesión. La validación real
 * del token la hace la API; las páginas protegidas también lo verifican.
 * Nota: el proxy no puede importar "server-only"/lib/config, por eso el
 * nombre de la cookie se repite aquí (debe coincidir con COOKIE_NAME).
 */
const COOKIE_NAME = "ecom_token";
const PROTECTED = ["/checkout", "/historial"];
const GUEST_ONLY = ["/login", "/registro"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(COOKIE_NAME)?.value);

  if (!hasSession && PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (hasSession && GUEST_ONLY.includes(pathname)) {
    return NextResponse.redirect(new URL("/productos", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/checkout/:path*", "/historial/:path*", "/login", "/registro"],
};
