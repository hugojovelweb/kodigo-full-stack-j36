"use client";
import { useState } from "react";
import { ESTILOS, TATTOOS, type Estilo } from "../lib/tattoos";

export function Gallery() {
  const [filtro, setFiltro] = useState<Estilo | "Todos">("Todos");
  const visibles = filtro === "Todos" ? TATTOOS : TATTOOS.filter((t) => t.estilo === filtro);

  return (
    <>
      <div className="filters" role="group" aria-label="Filtrar por estilo">
        {(["Todos", ...ESTILOS] as const).map((e) => (
          <button key={e} type="button" className="chip" aria-pressed={filtro === e} onClick={() => setFiltro(e)}>
            {e}
          </button>
        ))}
      </div>
      <div className="grid" data-testid="galeria">
        {visibles.map((t) => (
          <article className="card" key={t.id}>
            {t.art}
            <small>{t.estilo}</small>
            <h3>{t.nombre}</h3>
          </article>
        ))}
      </div>
    </>
  );
}
