"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ApiError, apiFetch } from "@/lib/api";
import { ENDPOINTS } from "@/lib/config";
import { extractToken } from "@/lib/data";
import { safeNext } from "@/lib/format";
import { clearToken, setToken } from "@/lib/session";
import type { FormState } from "@/lib/types";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

function fail(e: unknown, values: Record<string, string>): FormState {
  if (e instanceof ApiError) {
    return {
      message:
        e.status === 401 || e.status === 422
          ? e.message || "Credenciales inválidas."
          : e.message,
      errors: e.errors,
      values,
    };
  }
  return { message: "Ocurrió un error inesperado. Intenta de nuevo.", values };
}

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = str(formData, "email");
  const password = String(formData.get("password") ?? "");
  const values = { email };

  const errors: Record<string, string[]> = {};
  if (!EMAIL.test(email)) errors.email = ["Ingresa un correo válido."];
  if (!password) errors.password = ["Ingresa tu contraseña."];
  if (Object.keys(errors).length) return { errors, values };

  let token: string | null;
  try {
    token = extractToken(
      await apiFetch(ENDPOINTS.login, { method: "POST", body: { email, password } }),
    );
  } catch (e) {
    return fail(e, values);
  }
  if (!token) return { message: "La API no devolvió un token.", values };

  await setToken(token);
  revalidatePath("/", "layout"); // refresca el header (sesión iniciada)
  redirect(safeNext(formData.get("next"))); // redirect FUERA de try/catch
}

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = str(formData, "name");
  const email = str(formData, "email");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("password_confirmation") ?? "");
  const values = { name, email };

  const errors: Record<string, string[]> = {};
  if (name.length < 2) errors.name = ["Ingresa tu nombre."];
  if (!EMAIL.test(email)) errors.email = ["Ingresa un correo válido."];
  if (password.length < 8) errors.password = ["Mínimo 8 caracteres."];
  if (password !== confirm)
    errors.password_confirmation = ["Las contraseñas no coinciden."];
  if (Object.keys(errors).length) return { errors, values };

  let token: string | null;
  try {
    const json = await apiFetch(ENDPOINTS.register, {
      method: "POST",
      body: { name, email, password, password_confirmation: confirm },
    });
    token = extractToken(json);
    // Si la API no devuelve token al registrar, iniciamos sesión con las mismas credenciales.
    if (!token) {
      token = extractToken(
        await apiFetch(ENDPOINTS.login, { method: "POST", body: { email, password } }),
      );
    }
  } catch (e) {
    return fail(e, values);
  }
  if (!token) return { message: "Cuenta creada, pero no se obtuvo token. Inicia sesión.", values };

  await setToken(token);
  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function logoutAction(): Promise<void> {
  try {
    await apiFetch(ENDPOINTS.logout, { method: "POST", auth: true });
  } catch {
    // Aunque la API falle, se elimina la cookie local.
  }
  await clearToken();
  revalidatePath("/", "layout");
  redirect("/");
}
