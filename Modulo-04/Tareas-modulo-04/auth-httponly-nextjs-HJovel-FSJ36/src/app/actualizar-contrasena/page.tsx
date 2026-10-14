import { UpdatePasswordForm } from "@/components/auth-forms";

export const metadata = { title: "Nueva contraseña" };

// Ruta protegida por el proxy: solo accesible con la sesión de recuperación creada en /auth/confirm.
export default function UpdatePasswordPage() {
  return (
    <section className="card narrow">
      <h1>Crea tu nueva contraseña</h1>
      <UpdatePasswordForm />
    </section>
  );
}
