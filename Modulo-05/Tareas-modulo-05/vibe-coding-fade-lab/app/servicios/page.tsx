import type { Metadata } from "next";
import Link from "next/link";
import { formatearPrecio } from "@/lib/fechas";
import { listarServicios, obtenerNegocio } from "@/lib/repositories/catalogo";

export const metadata: Metadata = { title: "Servicios" };

export default async function ServiciosPage() {
  const negocio = await obtenerNegocio();
  const servicios = await listarServicios(negocio.id);
  return (
    <div>
      <h1 className="font-display text-4xl font-extrabold">Servicios</h1>
      <p className="mt-2 max-w-prose text-tenue">Precios en USD. La duración define cuánto tiempo se bloquea en la agenda.</p>
      <ul className="mt-8 divide-y divide-borde overflow-hidden rounded-2xl border border-borde bg-superficie">
        {servicios.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-xl font-bold">{s.nombre}</h2>
              <p className="text-sm text-tenue">{s.descripcion}</p>
            </div>
            <div className="text-right"><p className="text-xl font-extrabold">{formatearPrecio(s.precioCentavos)}</p><p className="text-xs text-tenue">{s.duracionMin} min</p></div>
          </li>
        ))}
      </ul>
      <Link href="/reservar" className="mt-8 inline-block rounded-full bg-lima px-7 py-3 font-bold text-fondo hover:bg-lima-oscuro">Reservar ahora →</Link>
    </div>
  );
}
