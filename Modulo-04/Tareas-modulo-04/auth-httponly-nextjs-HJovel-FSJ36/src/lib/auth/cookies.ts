import "server-only";

/**
 * Política ÚNICA de la cookie de sesión (Server Actions, Route Handlers y proxy).
 *
 * - httpOnly : JavaScript del navegador NO puede leerla (mitiga robo de sesión por XSS).
 * - secure   : solo viaja por HTTPS (producción).
 * - sameSite : "lax" no envía la cookie en POST entre sitios (mitiga CSRF) y permite
 *              la navegación normal (p. ej. abrir la app desde un enlace del correo).
 * - path "/" y prefijo __Host- en producción: la cookie no se puede fijar desde un
 *   subdominio ni con otro path/domain (protege contra "cookie tossing").
 */
export const isProduction = process.env.NODE_ENV === "production";

/** "Secure" solo en producción y cuando el sitio NO es http://localhost (así `npm run start` local funciona en todos los navegadores). */
export const useHttps =
  isProduction && !/^http:\/\/(localhost|127\.0\.0\.1)/.test(process.env.NEXT_PUBLIC_SITE_URL ?? "");

export const SESSION_COOKIE = useHttps ? "__Host-sid" : "sid";

export function sessionCookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: useHttps,
    sameSite: "lax" as const,
    path: "/",
    expires,
  };
}

export const expiredCookieOptions = {
  httpOnly: true,
  secure: useHttps,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 0,
};
