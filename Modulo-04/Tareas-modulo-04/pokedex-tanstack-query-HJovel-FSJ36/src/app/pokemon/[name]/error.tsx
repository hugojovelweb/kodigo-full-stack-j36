"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert" className="state state--error">
      <h1>Algo salió mal</h1>
      <p>{error.message || "No se pudo conectar con la PokéAPI."}</p>
      <button type="button" onClick={reset}>
        Reintentar
      </button>
    </div>
  );
}
