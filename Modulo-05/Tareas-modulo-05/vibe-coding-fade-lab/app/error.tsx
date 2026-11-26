"use client";

import { useEffect } from "react";

// Error UI global: captura errores de ejecucion (p. ej. base de datos caida) y permite reintentar.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="rounded-2xl border border-error/60 bg-superficie p-6">
      <h1 className="font-display text-3xl font-extrabold">Algo salió mal</h1>
      <p className="mt-2 text-tenue">No pudimos cargar esta página. Puedes intentarlo de nuevo en unos segundos.</p>
      {error.digest && <p className="mt-1 text-xs text-tenue">Código: {error.digest}</p>}
      <button type="button" onClick={reset} className="mt-4 rounded-full bg-lima px-5 py-2 font-bold text-fondo hover:bg-lima-oscuro">Reintentar</button>
    </div>
  );
}
