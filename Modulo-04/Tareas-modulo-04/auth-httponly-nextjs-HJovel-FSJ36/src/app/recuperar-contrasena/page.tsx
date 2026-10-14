import { ForgotPasswordForm } from "@/components/auth-forms";

export const metadata = { title: "Recuperar contraseña" };

export default function ForgotPasswordPage() {
  return (
    <section className="card narrow">
      <h1>Recuperar contraseña</h1>
      <p className="muted">Te enviaremos un enlace para crear una contraseña nueva.</p>
      <ForgotPasswordForm />
    </section>
  );
}
