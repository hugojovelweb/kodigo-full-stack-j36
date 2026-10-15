import { z } from "zod";

/**
 * Esquemas de validación COMPARTIDOS: se ejecutan en el navegador (experiencia de
 * usuario) y de nuevo en el servidor (seguridad real: el cliente nunca es confiable).
 */
const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "El correo es obligatorio.")
  .max(254, "El correo es demasiado largo.")
  .pipe(z.email("Ingresa un correo válido."));

const password = z
  .string()
  .min(8, "Mínimo 8 caracteres.")
  .max(128, "Máximo 128 caracteres.")
  .regex(/[a-z]/, "Incluye al menos una minúscula.")
  .regex(/[A-Z]/, "Incluye al menos una mayúscula.")
  .regex(/[0-9]/, "Incluye al menos un número.");

export const signUpSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, "Mínimo 2 caracteres.")
      .max(60, "Máximo 60 caracteres."),
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden.",
  });

export const signInSchema = z.object({
  email,
  // En login no se re-evalúa la política: solo que no venga vacío.
  password: z.string().min(1, "La contraseña es obligatoria.").max(128),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(20, "Enlace inválido.").max(100, "Enlace inválido."),
    password,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden.",
  });

export const profileSchema = z.object({
  displayName: z.string().trim().min(2, "Mínimo 2 caracteres.").max(60, "Máximo 60 caracteres."),
});

export type FieldErrors = Record<string, string[] | undefined>;

export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: FieldErrors;
  /** Valores no sensibles para repoblar el formulario tras un error (nunca contraseñas). */
  values?: Record<string, string>;
};

export const initialState: ActionState = { ok: false };

/** Convierte un ZodError en { campo: [mensajes] }. */
export function flattenErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    (out[key] ??= []).push(issue.message);
  }
  return out;
}
