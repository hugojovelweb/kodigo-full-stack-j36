"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { env, emailVerificationEnabled } from "@/lib/env";
import { safeNext } from "@/lib/safe-redirect";
import { hashPassword, verifyPassword, burnPasswordCheck } from "@/lib/auth/password";
import { generateToken, hashToken } from "@/lib/auth/tokens";
import {
  createSession,
  deleteSessionCookie,
  getSessionToken,
  invalidateAllUserSessions,
  invalidateSession,
  setSessionCookie,
} from "@/lib/auth/session";
import { getCurrentUser } from "@/lib/auth/dal";
import { clearRateLimit, clientIp, rateLimit } from "@/lib/auth/rate-limit";
import { actionEmail, sendEmail } from "@/lib/email";
import {
  flattenErrors,
  forgotPasswordSchema,
  profileSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  type ActionState,
} from "@/lib/validations/auth";

const str = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
};

const TOO_MANY = "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";

async function userAgent() {
  return (await headers()).get("user-agent");
}

/** Crea un token de un solo uso y devuelve el enlace listo para enviar por correo. */
async function issueEmailToken(userId: string, type: "verify" | "reset") {
  const token = generateToken();
  const ttlMinutes = type === "verify" ? 24 * 60 : 60;
  // Invalida los tokens anteriores del mismo tipo que sigan sin usarse.
  await sql()`delete from email_tokens where user_id = ${userId} and type = ${type} and used_at is null`;
  await sql()`
    insert into email_tokens (id, user_id, type, expires_at)
    values (${hashToken(token)}, ${userId}, ${type}, now() + make_interval(mins => ${ttlMinutes}))`;
  return type === "verify"
    ? `${env.siteUrl}/auth/confirm?token=${token}`
    : `${env.siteUrl}/actualizar-contrasena?token=${token}`;
}

/* ------------------------------------------------------------------ */
/* REGISTRO                                                           */
/* ------------------------------------------------------------------ */
export async function signUpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = {
    displayName: str(formData, "displayName"),
    email: str(formData, "email"),
    password: str(formData, "password"),
    confirmPassword: str(formData, "confirmPassword"),
  };
  const values = { displayName: raw.displayName, email: raw.email };
  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: flattenErrors(parsed.error), values };

  const ip = await clientIp();
  if (!(await rateLimit(`signup:${ip}`, 5, 60 * 60))) return { ok: false, values, message: TOO_MANY };

  const { displayName, email, password } = parsed.data;
  const verification = emailVerificationEnabled();
  const passwordHash = await hashPassword(password);

  const inserted = (await sql()`
    insert into users (email, password_hash, display_name, email_verified_at)
    values (${email}, ${passwordHash}, ${displayName}, ${verification ? null : new Date().toISOString()})
    on conflict (email) do nothing
    returning id`) as unknown as { id: string }[];

  const userId = inserted[0]?.id;

  if (verification) {
    // Respuesta idéntica exista o no el correo (anti-enumeración).
    if (userId) {
      const link = await issueEmailToken(userId, "verify");
      await sendEmail({ to: email, ...actionEmail("verify", displayName, link) });
    }
    return {
      ok: true,
      message: "Registro recibido. Si el correo es válido, te enviamos un enlace para confirmar tu cuenta.",
    };
  }

  // Sin proveedor de correo (desarrollo/demo): no hay verificación, se inicia sesión directo.
  if (!userId) {
    return { ok: false, values, message: "Ese correo ya está registrado. Inicia sesión." };
  }
  const { token, expiresAt } = await createSession(userId, await userAgent());
  await setSessionCookie(token, expiresAt);
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/* ------------------------------------------------------------------ */
/* LOGIN                                                              */
/* ------------------------------------------------------------------ */
export async function signInAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = { email: str(formData, "email"), password: str(formData, "password") };
  const values = { email: raw.email };
  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: flattenErrors(parsed.error), values };

  const { email, password } = parsed.data;
  const ip = await clientIp();
  const key = `login:${ip}:${email}`;
  if (!(await rateLimit(key, 5, 15 * 60)) || !(await rateLimit(`login-ip:${ip}`, 30, 15 * 60))) {
    return { ok: false, values, message: TOO_MANY };
  }

  const rows = (await sql()`
    select id, password_hash, email_verified_at from users where email = ${email} limit 1`) as unknown as {
    id: string;
    password_hash: string;
    email_verified_at: string | null;
  }[];
  const user = rows[0];

  // Mismo trabajo y mismo mensaje exista o no el usuario.
  const valid = user ? await verifyPassword(password, user.password_hash) : (await burnPasswordCheck(password), false);
  if (!user || !valid) return { ok: false, values, message: "Correo o contraseña incorrectos." };

  if (emailVerificationEnabled() && !user.email_verified_at) {
    return { ok: false, values, message: "Debes confirmar tu correo antes de iniciar sesión." };
  }

  await clearRateLimit(key);
  const { token, expiresAt } = await createSession(user.id, await userAgent());
  await setSessionCookie(token, expiresAt);
  revalidatePath("/", "layout");
  redirect(safeNext(str(formData, "next")));
}

/* ------------------------------------------------------------------ */
/* LOGOUT                                                             */
/* ------------------------------------------------------------------ */
export async function signOutAction(): Promise<void> {
  const token = await getSessionToken();
  if (token) await invalidateSession(token); // se borra la sesión EN EL SERVIDOR
  await deleteSessionCookie();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function signOutEverywhereAction(): Promise<void> {
  const user = await getCurrentUser();
  if (user) await invalidateAllUserSessions(user.id);
  await deleteSessionCookie();
  revalidatePath("/", "layout");
  redirect("/login");
}

/* ------------------------------------------------------------------ */
/* RECUPERAR CONTRASEÑA                                               */
/* ------------------------------------------------------------------ */
export async function forgotPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = { email: str(formData, "email") };
  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: flattenErrors(parsed.error), values: raw };

  const ip = await clientIp();
  if (!(await rateLimit(`forgot:${ip}`, 5, 60 * 60))) return { ok: false, values: raw, message: TOO_MANY };

  const rows = (await sql()`
    select id, display_name from users where email = ${parsed.data.email} limit 1`) as unknown as {
    id: string;
    display_name: string;
  }[];
  const user = rows[0];
  if (user) {
    const link = await issueEmailToken(user.id, "reset");
    await sendEmail({ to: parsed.data.email, ...actionEmail("reset", user.display_name, link) });
  }

  // Respuesta idéntica exista o no el correo (anti-enumeración).
  return { ok: true, message: "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña." };
}

/* ------------------------------------------------------------------ */
/* RESTABLECER CONTRASEÑA (enlace del correo)                         */
/* ------------------------------------------------------------------ */
export async function resetPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: str(formData, "token"),
    password: str(formData, "password"),
    confirmPassword: str(formData, "confirmPassword"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: flattenErrors(parsed.error) };

  const ip = await clientIp();
  if (!(await rateLimit(`reset:${ip}`, 10, 60 * 60))) return { ok: false, message: TOO_MANY };

  const passwordHash = await hashPassword(parsed.data.password);

  // UNA sola sentencia atómica: consume el token, cambia la clave y cierra TODAS las sesiones.
  const rows = (await sql()`
    with t as (
      update email_tokens set used_at = now()
      where id = ${hashToken(parsed.data.token)} and type = 'reset' and used_at is null and expires_at > now()
      returning user_id
    ),
    u as (
      update users
      set password_hash = ${passwordHash}, updated_at = now(), email_verified_at = coalesce(email_verified_at, now())
      from t where users.id = t.user_id
      returning users.id
    ),
    d as (delete from sessions using u where sessions.user_id = u.id)
    select id from u`) as unknown as { id: string }[];

  if (!rows[0]) {
    return { ok: false, message: "El enlace es inválido o ya venció. Solicita uno nuevo." };
  }

  revalidatePath("/", "layout");
  redirect("/login?reset=1");
}

/* ------------------------------------------------------------------ */
/* PERFIL                                                             */
/* ------------------------------------------------------------------ */
export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = { displayName: str(formData, "displayName") };
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: flattenErrors(parsed.error), values: raw };

  const user = await getCurrentUser(); // la identidad sale de la sesión, jamás del formulario
  if (!user) redirect("/login");

  await sql()`update users set display_name = ${parsed.data.displayName}, updated_at = now() where id = ${user.id}`;
  revalidatePath("/", "layout");
  return { ok: true, values: raw, message: "Perfil actualizado correctamente." };
}
