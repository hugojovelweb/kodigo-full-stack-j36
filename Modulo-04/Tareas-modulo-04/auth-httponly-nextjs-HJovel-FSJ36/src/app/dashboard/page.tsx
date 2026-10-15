import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/auth-forms";
import { SessionProbe } from "@/components/session-probe";
import { getSession } from "@/lib/auth/dal";
import { signOutEverywhereAction } from "@/lib/actions/auth";

export const metadata = { title: "Dashboard" };

const fmt = (iso?: string | Date | null) =>
  iso ? new Intl.DateTimeFormat("es-SV", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)) : "—";

export default async function DashboardPage() {
  const session = await getSession();
  // Segunda línea de defensa: el proxy ya protege la ruta, pero cada página valida por sí misma.
  if (!session) redirect("/login");
  const { user, expiresAt } = session;

  return (
    <>
      <h1>Hola, {user.displayName} 👋</h1>

      <div className="grid two">
        <section className="card">
          <h2>Tu cuenta</h2>
          <dl className="kv">
            <dt>Correo</dt><dd>{user.email}</dd>
            <dt>ID de usuario</dt><dd className="mono">{user.id}</dd>
            <dt>Correo confirmado</dt><dd>{user.emailVerified ? "Sí" : "No"}</dd>
            <dt>Cuenta creada</dt><dd>{fmt(user.createdAt)}</dd>
            <dt>Sesión vence</dt><dd>{fmt(expiresAt)}</dd>
          </dl>
          <form action={signOutEverywhereAction} style={{ marginTop: "1rem" }}>
            <button className="btn ghost" type="submit">Cerrar sesión en todos los dispositivos</button>
          </form>
        </section>

        <section className="card">
          <h2>Editar perfil</h2>
          <ProfileForm displayName={user.displayName} />
        </section>
      </div>

      <section className="card">
        <h2>Verificación de seguridad de la sesión</h2>
        <p className="muted small">
          Esta comprobación corre en tu navegador y hace lo mismo que haría un script malicioso (XSS).
        </p>
        <SessionProbe />
      </section>
    </>
  );
}
