"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/equipo", label: "Equipo" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeader({ nombre }: { nombre: string }) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  // Cierra el menu movil al navegar.
  useEffect(() => setAbierto(false), [pathname]);

  return (
    <header className="sticky top-0 z-20 border-b border-borde bg-fondo/85 backdrop-blur">
      <nav aria-label="Principal" className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="font-display text-xl font-extrabold tracking-tight">
          {nombre}<span className="text-lima">.</span>
        </Link>
        <ul
          id="menu-principal"
          className={`${abierto ? "flex" : "hidden"} absolute left-0 right-0 top-full flex-col gap-1 border-b border-borde bg-fondo p-4 md:static md:flex md:flex-row md:items-center md:gap-6 md:border-0 md:bg-transparent md:p-0`}
        >
          {LINKS.map((l) => {
            const activo = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link href={l.href} aria-current={activo ? "page" : undefined}
                  className={`block py-2 text-sm font-medium hover:text-lima md:py-1 ${activo ? "text-lima" : "text-tenue"}`}>
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center gap-2">
          <Link href="/reservar" className="rounded-full bg-lima px-4 py-2 text-sm font-bold text-fondo hover:bg-lima-oscuro">Reservar</Link>
          <button type="button" aria-expanded={abierto} aria-controls="menu-principal" onClick={() => setAbierto((v) => !v)}
            className="rounded-full border border-borde px-3 py-2 text-sm md:hidden">
            {abierto ? "Cerrar" : "Menú"}
          </button>
        </div>
      </nav>
    </header>
  );
}
