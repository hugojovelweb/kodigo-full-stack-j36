"use client";

export default function Error({ error, reset }) {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-24 text-center">
      <h2 className="font-display text-2xl text-ink">
        No se pudo cargar esta categoría
      </h2>
      <p className="text-sm text-muted mt-2">{error?.message}</p>
      <button
        onClick={() => reset()}
        className="mt-6 px-5 py-2.5 border border-rust text-rust-light hover:bg-rust hover:text-bg transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
