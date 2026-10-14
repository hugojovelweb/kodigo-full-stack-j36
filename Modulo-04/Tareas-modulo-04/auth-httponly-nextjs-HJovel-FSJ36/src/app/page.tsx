import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <section className="hero">
        <h1>Autenticación segura con cookies <span className="accent">httpOnly</span></h1>
        <p className="muted lead">
          Next.js 16 · Supabase · Server Actions · proxy (middleware) · protección XSS y CSRF.
        </p>
        <div className="row">
          {user ? (
            <Link className="btn" href="/dashboard">Ir al dashboard</Link>
          ) : (
            <>
              <Link className="btn" href="/registro">Crear cuenta</Link>
              <Link className="btn ghost" href="/login">Iniciar sesión</Link>
            </>
          )}
        </div>
      </section>
      <section className="grid">
        <article className="card"><h2>Cookies httpOnly</h2><p className="muted">El token nunca es accesible desde JavaScript del navegador.</p></article>
        <article className="card"><h2>Anti-CSRF</h2><p className="muted">sameSite=lax, verificación de Origin y Server Actions.</p></article>
        <article className="card"><h2>Anti-XSS</h2><p className="muted">CSP con nonce, escape de React y validación en servidor.</p></article>
      </section>
    </>
  );
}
