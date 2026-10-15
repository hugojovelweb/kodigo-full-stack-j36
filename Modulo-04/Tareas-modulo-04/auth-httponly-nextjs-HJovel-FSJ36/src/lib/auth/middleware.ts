import { NextResponse, type NextRequest } from "next/server";
import { validateSessionToken } from "./session";
import { SESSION_COOKIE, expiredCookieOptions, sessionCookieOptions } from "./cookies";

/** Rutas que exigen sesión. */
const PROTECTED_PREFIXES = ["/dashboard"];
/** Rutas solo para visitantes (un usuario autenticado es enviado al dashboard). */
const GUEST_ONLY = ["/login", "/registro", "/recuperar-contrasena"];

const matches = (pathname: string, routes: string[]) =>
  routes.some((r) => pathname === r || pathname.startsWith(`${r}/`));

/**
 * Lógica del proxy (middleware):
 *  1. Valida la cookie httpOnly contra la base de datos (Neon).
 *  2. Renueva la sesión (y la cookie) cuando le queda menos de la mitad de vida.
 *  3. Borra la cookie si ya no es válida.
 *  4. Redirige: privadas → /login ; login/registro con sesión → /dashboard.
 */
export async function updateSession(request: NextRequest, extraHeaders: Record<string, string> = {}) {
  const csp = extraHeaders["Content-Security-Policy"];

  const withCsp = <T extends NextResponse>(res: T): T => {
    if (csp) res.headers.set("Content-Security-Policy", csp);
    return res;
  };

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await validateSessionToken(token) : null;

  const headers = new Headers(request.headers);
  Object.entries(extraHeaders).forEach(([k, v]) => headers.set(k, v));
  const response = withCsp(NextResponse.next({ request: { headers } }));

  if (token && !session) response.cookies.set(SESSION_COOKIE, "", expiredCookieOptions);
  if (token && session?.refreshed) {
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(session.expiresAt));
  }

  const { pathname, search } = request.nextUrl;

  const redirectTo = (path: string, searchParams?: Record<string, string>) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    Object.entries(searchParams ?? {}).forEach(([k, v]) => url.searchParams.set(k, v));
    const redirect = withCsp(NextResponse.redirect(url));
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  };

  if (!session && matches(pathname, PROTECTED_PREFIXES)) {
    return redirectTo("/login", { next: `${pathname}${search}` });
  }
  if (session && matches(pathname, GUEST_ONLY)) {
    return redirectTo("/dashboard");
  }
  return response;
}
