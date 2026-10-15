import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth-forms";

export const metadata = { title: "Nueva contraseña", robots: { index: false, follow: false } };

// El enlace del correo trae ?token=… (un solo uso, vence en 1 hora). Se envía por POST
// (Server Action) y el token nunca se guarda en cookies ni en localStorage.
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <section className="card narrow">
        <h1>Enlace inválido</h1>
        <p className="muted">Falta el token. Solicita un nuevo enlace de recuperación.</p>
        <Link className="btn" href="/recuperar-contrasena">Recuperar contraseña</Link>
      </section>
    );
  }
  return (
    <section className="card narrow">
      <h1>Crea tu nueva contraseña</h1>
      <ResetPasswordForm token={token} />
    </section>
  );
}
