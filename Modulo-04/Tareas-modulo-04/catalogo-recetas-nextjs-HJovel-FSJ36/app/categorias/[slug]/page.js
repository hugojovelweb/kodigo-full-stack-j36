import { notFound } from "next/navigation";
import { getCategoriaConRecetas, getCategorias } from "@/lib/queries";
import RecetaCard from "@/components/RecetaCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const categoria = await getCategoriaConRecetas(slug);
  if (!categoria) return { title: "Categoría no encontrada" };
  return {
    title: `${categoria.nombre} — Cocina de Barrio`,
    description: categoria.descripcion,
  };
}

// Server Component con ruta dinámica [slug] para filtrar recetas por categoría.
export default async function CategoriaPage({ params }) {
  const { slug } = await params;
  const categoria = await getCategoriaConRecetas(slug);

  if (!categoria) {
    notFound();
  }

  return (
    <div>
      <header className="max-w-6xl mx-auto px-6 md:px-10 pt-16 pb-10 border-b border-line">
        <p className="text-sm text-sage-light mb-3">Categoría</p>
        <h1 className="font-display text-4xl md:text-5xl text-ink">
          {categoria.nombre}
        </h1>
        {categoria.descripcion && (
          <p className="mt-4 text-muted max-w-lg">{categoria.descripcion}</p>
        )}
      </header>

      <section className="max-w-6xl mx-auto px-6 md:px-10 py-14">
        {categoria.recetas.length === 0 ? (
          <p className="text-muted">Todavía no hay recetas en esta categoría.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {categoria.recetas.map((receta) => (
              <RecetaCard key={receta.id} receta={receta} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
