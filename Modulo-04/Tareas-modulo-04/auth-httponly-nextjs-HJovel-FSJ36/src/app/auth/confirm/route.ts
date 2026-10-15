import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { hashToken } from "@/lib/auth/tokens";

/**
 * Confirma el correo con el enlace de un solo uso enviado por email.
 * El token llega en claro, se compara su hash SHA-256 con la base de datos y se
 * marca como usado en la misma sentencia (no se puede reutilizar).
 * NO inicia sesión automáticamente: el usuario debe ingresar su contraseña.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token") ?? "";

  if (token.length >= 20 && token.length <= 100) {
    const rows = (await sql()`
      with t as (
        update email_tokens set used_at = now()
        where id = ${hashToken(token)} and type = 'verify' and used_at is null and expires_at > now()
        returning user_id
      )
      update users set email_verified_at = now(), updated_at = now()
      from t where users.id = t.user_id
      returning users.id`) as unknown as { id: string }[];

    if (rows[0]) return NextResponse.redirect(new URL("/login?verified=1", origin));
  }
  return NextResponse.redirect(new URL("/auth/error", origin));
}
