import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-24 text-center">
      <h2 className="font-display text-3xl text-ink">Categoría no encontrada</h2>
      <Link
        href="/"
        className="inline-block mt-6 text-sage-light hover:text-sage transition-colors"
      >
        Ver todas las recetas
      </Link>
    </div>
  );
}
