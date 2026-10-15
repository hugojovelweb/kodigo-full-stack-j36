/**
 * Lectura centralizada y validada de variables de entorno (solo servidor).
 * Ninguna variable de este proyecto lleva el prefijo NEXT_PUBLIC_ salvo la URL
 * del sitio: la cadena de conexión a la base de datos JAMÁS debe llegar al navegador.
 */
function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Copia .env.example a .env.local y complétala.`,
    );
  }
  return value;
}

export const env = {
  /** Cadena de conexión de Neon (pooled), p. ej. postgresql://user:pass@ep-xxx-pooler.../neondb?sslmode=require */
  get databaseUrl(): string {
    return required(process.env.DATABASE_URL, "DATABASE_URL");
  },
  /** URL pública de la app, sin barra final. Se usa en los enlaces de los correos. */
  get siteUrl(): string {
    return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  },
  /** Opcional. Si existe, se envían correos reales (verificación y recuperación) con Resend. */
  get resendApiKey(): string | undefined {
    return process.env.RESEND_API_KEY || undefined;
  },
  get emailFrom(): string {
    return process.env.EMAIL_FROM || "SecureAuth <onboarding@resend.dev>";
  },
};

/** La verificación de correo se activa automáticamente cuando hay proveedor de correo. */
export const emailVerificationEnabled = () => Boolean(env.resendApiKey);
