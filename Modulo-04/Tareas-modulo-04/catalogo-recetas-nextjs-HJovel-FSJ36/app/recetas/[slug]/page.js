import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecetaPorSlug, getRecetas } from "@/lib/queries";

export const dynamic = "force-dynamic";


export async function generateMetadata({ params }) {
  const { slug } = await params;
  const receta = await getRecetaPorSlug(slug);
  if (!receta) return { title: "Receta no encontrada" };
  return {
    title: `${receta.titulo} — Cocina de Barrio`,
    description: receta.descripcion,
  };
}

// Server Component con ruta dinámica: recibe el segmento [slug] vía params.
export default async function RecetaPage({ params }) {
  const { slug } = await params;
  const receta = await getRecetaPorSlug(slug);

  if (!receta) {
    notFound();
  }

  return (
    <article>
      <div className="relative w-full h-[46vh] md:h-[56vh] bg-surface">
        {receta.imagen_url && (
          <Image
            src={receta.imagen_url}
            alt={receta.titulo}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/10 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 max-w-6xl mx-auto px-6 md:px-10 pb-10">
          {receta.categorias?.nombre && (
            <Link
              href={`/categorias/${receta.categorias.slug}`}
              className="text-sm text-sage-light hover:text-sage transition-colors"
            >
              {receta.categorias.nombre}
            </Link>
          )}
          <h1 className="font-display text-4xl md:text-5xl text-ink mt-2 max-w-2xl">
            {receta.titulo}
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-4 order-2 md:order-1">
          <div className="flex gap-6 text-sm text-muted border-y border-line py-4 mb-8">
            <span>{receta.tiempo_preparacion} min</span>
            <span>{receta.dificultad}</span>
          </div>

          <h2 className="font-display text-xl text-ink mb-4">Ingredientes</h2>
          <ul className="space-y-2 text-ink/90">
            {(receta.ingredientes ?? []).map((ing, i) => (
              <li key={i} className="border-b border-line pb-2">
                {ing}
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-8 order-1 md:order-2">
          <p className="text-lg text-ink/90 max-w-2xl">{receta.descripcion}</p>

          <h2 className="font-display text-xl text-ink mt-10 mb-5">Preparación</h2>
          <ol className="space-y-6 max-w-2xl">
            {(receta.pasos ?? []).map((paso, i) => (
              <li key={i} className="flex gap-4">
                <span className="font-display italic text-rust-light text-lg shrink-0">
                  {i + 1}
                </span>
                <span className="text-ink/90">{paso}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </article>
  );
}
