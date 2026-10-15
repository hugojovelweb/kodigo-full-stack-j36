import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { signOutAction } from "@/lib/actions/auth";

/** Navegación condicional según el estado de autenticación (Server Component). */
export function SiteHeader({ user }: { user: User | null }) {
  return (
    <header className="site-header">
      <Link href="/" className="brand">🔐 SecureAuth</Link>
      <nav aria-label="Principal">
        {user ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <span className="muted small hide-sm">{user.email}</span>
            <form action={signOutAction}>
              <button className="btn ghost" type="submit">Cerrar sesión</button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login">Iniciar sesión</Link>
            <Link className="btn" href="/registro">Registrarse</Link>
          </>
        )}
      </nav>
    </header>
  );
}
