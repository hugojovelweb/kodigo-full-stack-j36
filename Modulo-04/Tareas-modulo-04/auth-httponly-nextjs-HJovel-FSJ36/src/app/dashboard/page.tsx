import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/auth-forms";
import { SessionProbe } from "@/components/session-probe";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard" };

const fmt = (iso?: string | null) =>
  iso ? new Intl.DateTimeFormat("es-SV", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)) : "—";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ password?: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Segunda línea de defensa: el proxy ya protege la ruta, pero cada página valida por sí misma.
  if (!user) redirect("/login");

  const { password } = await searchParams;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const displayName = profile?.display_name ?? (user.user_metadata?.display_name as string | undefined) ?? "";

  return (
    <>
      <h1>Hola{displayName ? `, ${displayName}` : ""} 👋</h1>
      {password === "updated" && <p className="notice success" role="status">Tu contraseña fue actualizada.</p>}

      <div className="grid two">
        <section className="card">
          <h2>Tu cuenta</h2>
          <dl className="kv">
            <dt>Correo</dt><dd>{user.email}</dd>
            <dt>ID de usuario</dt><dd className="mono">{user.id}</dd>
            <dt>Correo confirmado</dt><dd>{user.email_confirmed_at ? "Sí" : "No"}</dd>
            <dt>Cuenta creada</dt><dd>{fmt(user.created_at)}</dd>
            <dt>Último acceso</dt><dd>{fmt(user.last_sign_in_at)}</dd>
          </dl>
        </section>

        <section className="card">
          <h2>Editar perfil</h2>
          <ProfileForm displayName={displayName} />
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
