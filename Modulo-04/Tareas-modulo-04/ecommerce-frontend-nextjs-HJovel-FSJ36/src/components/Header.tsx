import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { getToken } from "@/lib/session";
import { CartLink } from "./CartLink";
import { SubmitButton } from "./SubmitButton";

export async function Header() {
  const loggedIn = Boolean(await getToken());
  const link = "rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100";

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="text-lg font-extrabold text-indigo-700">
          Tienda<span className="text-slate-900">Kodigo</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1" aria-label="Principal">
          <Link href="/productos" className={link}>Catálogo</Link>
          <CartLink />
          {loggedIn ? (
            <>
              <Link href="/historial" className={link}>Mis compras</Link>
              <form action={logoutAction}>
                <SubmitButton pendingText="Saliendo…" className="!bg-slate-800 !px-3 !py-2 text-sm hover:!bg-slate-900">
                  Cerrar sesión
                </SubmitButton>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={link}>Iniciar sesión</Link>
              <Link href="/registro" className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
