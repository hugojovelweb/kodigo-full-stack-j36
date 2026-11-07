"use client";

import { useEffect } from "react";

/** Vista reutilizable para los error.tsx de cada segmento. */
export function ErrorView({
  error,
  retry,
  title = "Algo salió mal",
}: {
  error: Error & { digest?: string };
  retry: () => void;
  title?: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <h2 className="text-xl font-bold text-red-800">{title}</h2>
      <p className="mt-2 text-sm text-red-700">
        {process.env.NODE_ENV === "development"
          ? error.message
          : "No pudimos completar la operación. Intenta de nuevo en unos segundos."}
      </p>
      {error.digest && <p className="mt-1 text-xs text-red-500">Ref: {error.digest}</p>}
      <button
        type="button"
        onClick={() => retry()}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
      >
        Reintentar
      </button>
    </div>
  );
}
