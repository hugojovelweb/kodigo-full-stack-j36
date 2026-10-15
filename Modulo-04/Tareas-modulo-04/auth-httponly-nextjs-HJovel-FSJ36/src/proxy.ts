import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/auth/middleware";
import { isProduction, useHttps } from "@/lib/auth/cookies";

/**
 * En Next.js 16 el archivo "middleware.ts" se renombró a "proxy.ts" (misma función:
 * código que corre ANTES de cada petición). Aquí se hace:
 *   1. Content-Security-Policy con nonce por petición (defensa XSS).
 *   2. Validación/renovación de sesión + protección de rutas (ver lib/auth/middleware.ts).
 */
export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isProduction ? "" : " 'unsafe-eval'"}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${isProduction ? "" : " ws: wss:"}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(useHttps ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

  return updateSession(request, {
    "x-nonce": nonce,
    "Content-Security-Policy": csp,
  });
}

export const config = {
  matcher: [
    // Todo excepto estáticos, imágenes optimizadas y favicon.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
