import "server-only";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { generateToken, hashToken } from "./tokens";
import { SESSION_COOKIE, expiredCookieOptions, sessionCookieOptions } from "./cookies";

/** Duración de la sesión: 7 días con renovación deslizante. */
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  createdAt: string;
};

export type ValidSession = {
  user: SessionUser;
  expiresAt: Date;
  /** true si se extendió la expiración y hay que volver a emitir la cookie. */
  refreshed: boolean;
};

type Row = {
  expires_at: string;
  id: string;
  email: string;
  display_name: string;
  email_verified_at: string | null;
  created_at: string;
};

/** Crea la sesión en la base de datos y devuelve el token EN CLARO (solo para la cookie). */
export async function createSession(userId: string, userAgent: string | null) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await sql()`
    insert into sessions (id, user_id, expires_at, user_agent)
    values (${hashToken(token)}, ${userId}, ${expiresAt.toISOString()}, ${userAgent?.slice(0, 255) ?? null})`;
  // Limpieza oportunista de sesiones vencidas.
  await sql()`delete from sessions where expires_at < now()`;
  return { token, expiresAt };
}

/** Valida el token de la cookie contra la base de datos (fuente de verdad). */
export async function validateSessionToken(token: string): Promise<ValidSession | null> {
  const rows = (await sql()`
    select s.expires_at, u.id, u.email, u.display_name, u.email_verified_at, u.created_at
    from sessions s
    join users u on u.id = s.user_id
    where s.id = ${hashToken(token)} and s.expires_at > now()
    limit 1`) as unknown as Row[];

  const row = rows[0];
  if (!row) return null;

  let expiresAt = new Date(row.expires_at);
  let refreshed = false;

  // Sesión deslizante: si queda menos de la mitad de vida, se extiende.
  if (expiresAt.getTime() - Date.now() < SESSION_TTL_MS / 2) {
    expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await sql()`update sessions set expires_at = ${expiresAt.toISOString()} where id = ${hashToken(token)}`;
    refreshed = true;
  }

  return {
    user: {
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      emailVerified: row.email_verified_at !== null,
      createdAt: new Date(row.created_at).toISOString(),
    },
    expiresAt,
    refreshed,
  };
}

export async function invalidateSession(token: string) {
  await sql()`delete from sessions where id = ${hashToken(token)}`;
}

export async function invalidateAllUserSessions(userId: string) {
  await sql()`delete from sessions where user_id = ${userId}`;
}

/* ---- Cookie (solo Server Actions / Route Handlers) ---- */
export async function setSessionCookie(token: string, expiresAt: Date) {
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));
}

export async function deleteSessionCookie() {
  (await cookies()).set(SESSION_COOKIE, "", expiredCookieOptions);
}

export async function getSessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}
