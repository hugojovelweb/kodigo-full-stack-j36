"use client";

import { useState } from "react";
import RutaCard from "@/components/RutaCard";
import type { Dificultad, Ruta } from "@/lib/types";

const NIVELES: Dificultad[] = ["Fácil", "Moderada", "Difícil"];

// Único Client Component de la página: guarda el filtro activo con useState.
// El resto de la home sigue siendo Server Component (ISR).
export default function FiltroDificultad({ rutas }: { rutas: Ruta[] }) {
  const [filtro, setFiltro] = useState<Dificultad | null>(null);

  const visibles = filtro ? rutas.filter((r) => r.dificultad === filtro) : rutas;

  const base = "rounded-full border px-4 py-1.5 text-sm font-semibold transition";
  const activo = "border-teal-700 bg-teal-700 text-white";
  const inactivo = "border-stone-300 bg-white text-stone-700 hover:border-teal-700 hover:text-teal-700";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Filtrar por dificultad">
        <button
          type="button"
          onClick={() => setFiltro(null)}
          aria-pressed={filtro === null}
          className={`${base} ${filtro === null ? activo : inactivo}`}
        >
          Todas
        </button>
        {NIVELES.map((nivel) => (
          <button
            key={nivel}
            type="button"
            onClick={() => setFiltro(nivel)}
            aria-pressed={filtro === nivel}
            className={`${base} ${filtro === nivel ? activo : inactivo}`}
          >
            {nivel}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
          No hay rutas con esta dificultad.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((r) => (
            <RutaCard key={r.id} ruta={r} />
          ))}
        </div>
      )}
    </div>
  );
}
