import Link from "next/link";

export const metadata = { title: "Enlace inválido" };

export default function AuthErrorPage() {
  return (
    <section className="card narrow">
      <h1>Enlace inválido o expirado</h1>
      <p className="muted">
        El enlace de confirmación ya fue usado o caducó. Solicita uno nuevo e inténtalo otra vez.
      </p>
      <div className="row">
        <Link className="btn" href="/recuperar-contrasena">Recuperar contraseña</Link>
        <Link className="btn ghost" href="/login">Ir a iniciar sesión</Link>
      </div>
    </section>
  );
}
