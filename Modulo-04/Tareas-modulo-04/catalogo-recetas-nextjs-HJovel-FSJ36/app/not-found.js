import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-24 text-center">
      <h2 className="font-display text-3xl text-ink">404 — No encontrado</h2>
      <p className="text-muted mt-2">Lo que buscas no existe o fue movido.</p>
      <Link
        href="/"
        className="inline-block mt-6 text-sage-light hover:text-sage transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
