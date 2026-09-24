import Image from "next/image";
import Link from "next/link";
import type { Ruta } from "@/lib/types";

const COLOR_DIFICULTAD: Record<string, string> = {
  "Fácil": "bg-emerald-100 text-emerald-700",
  "Moderada": "bg-amber-100 text-amber-700",
  "Difícil": "bg-rose-100 text-rose-700",
};

export default function RutaCard({ ruta }: { ruta: Ruta }) {
  return (
    <Link
      href={`/rutas/${ruta.id}`}
      className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {ruta.imagen_url && (
          <Image
            src={ruta.imagen_url}
            alt={ruta.nombre}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        )}
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
            COLOR_DIFICULTAD[ruta.dificultad] ?? "bg-stone-100 text-stone-700"
          }`}
        >
          {ruta.dificultad}
        </span>
      </div>
      <div className="space-y-2 p-5">
        {ruta.zonas && (
          <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            {ruta.zonas.nombre}
          </span>
        )}
        <h3 className="text-lg font-bold text-stone-900">{ruta.nombre}</h3>
        <p className="line-clamp-2 text-sm text-stone-600">{ruta.descripcion}</p>
        <p className="text-sm text-stone-500">
          {ruta.distancia_km} km - {ruta.duracion_horas} h
        </p>
      </div>
    </Link>
  );
}
