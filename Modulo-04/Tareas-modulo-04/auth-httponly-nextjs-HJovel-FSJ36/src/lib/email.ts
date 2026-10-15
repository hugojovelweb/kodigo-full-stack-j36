import "server-only";
import { env } from "@/lib/env";
import { isProduction } from "@/lib/auth/cookies";

/**
 * Envío de correo con la API REST de Resend (sin SDK).
 * - Con RESEND_API_KEY: envía el correo real.
 * - Sin clave en desarrollo: imprime el enlace en la consola del servidor (npm run dev).
 * - Sin clave en producción: no hace nada (el enlace no se registra en logs).
 */
export async function sendEmail(opts: { to: string; subject: string; text: string; html: string }) {
  const key = env.resendApiKey;
  if (!key) {
    if (!isProduction) {
      console.log(`\n📧 [DEV] Correo para ${opts.to}\n   Asunto: ${opts.subject}\n   ${opts.text}\n`);
    }
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.emailFrom, to: [opts.to], subject: opts.subject, text: opts.text, html: opts.html }),
  });
  if (!res.ok) {
    // No se propaga el detalle al usuario; queda solo en logs del servidor.
    console.error("Resend error", res.status);
  }
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function actionEmail(kind: "verify" | "reset", name: string, link: string) {
  const isVerify = kind === "verify";
  const subject = isVerify ? "Confirma tu correo · SecureAuth" : "Restablece tu contraseña · SecureAuth";
  const intro = isVerify
    ? "Confirma tu correo para activar tu cuenta."
    : "Recibimos una solicitud para restablecer tu contraseña. Si no fuiste tú, ignora este mensaje.";
  const cta = isVerify ? "Confirmar correo" : "Crear nueva contraseña";
  const validity = isVerify ? "24 horas" : "1 hora";
  return {
    subject,
    text: `Hola ${name}. ${intro}\n${cta}: ${link}\nEl enlace vence en ${validity}.`,
    html: `<p>Hola ${escapeHtml(name)},</p><p>${intro}</p><p><a href="${link}">${cta}</a></p><p>El enlace vence en ${validity}.</p>`,
  };
}
