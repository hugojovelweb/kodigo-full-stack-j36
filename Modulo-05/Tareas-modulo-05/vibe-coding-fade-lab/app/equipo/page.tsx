import type { Metadata } from "next";
import Link from "next/link";
import { listarProfesionales, obtenerNegocio } from "@/lib/repositories/catalogo";

export const metadata: Metadata = { title: "Equipo" };

export default async function EquipoPage() {
  const negocio = await obtenerNegocio();
  const equipo = await listarProfesionales(negocio.id);
  return (
    <div>
      <h1 className="font-display text-4xl font-extrabold">Equipo</h1>
      <p className="mt-2 max-w-prose text-tenue">Cada profesional tiene su propia agenda: reserva con quien más te guste.</p>
      <ul className="mt-8 grid gap-5 md:grid-cols-3">
        {equipo.map((p) => (
          <li key={p.id} className="flex flex-col rounded-2xl border border-borde bg-superficie p-6">
            <div aria-hidden className="grid h-16 w-16 place-items-center rounded-full bg-lima font-display text-2xl font-extrabold text-fondo">{p.nombre.charAt(0)}</div>
            <h2 className="mt-4 font-display text-2xl font-bold">{p.nombre}</h2>
            <p className="text-sm font-semibold uppercase tracking-wider text-lima">{p.especialidad}</p>
            <p className="mt-2 flex-1 text-tenue">{p.bio}</p>
            <Link href="/reservar" className="mt-4 font-semibold hover:text-lima">Reservar con {p.nombre.split(" ")[0]} →</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
