import { NextResponse, type NextRequest } from "next/server";
import { deleteSessionCookie, getSessionToken, invalidateSession } from "@/lib/auth/session";

/**
 * Cierre de sesión vía POST (para clientes sin Server Actions). Verifica que el
 * Origin coincida con el Host: defensa CSRF explícita en un Route Handler, donde
 * Next.js NO la aplica automáticamente como sí hace con las Server Actions.
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) {
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  }

  const token = await getSessionToken();
  if (token) await invalidateSession(token);
  await deleteSessionCookie();
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
