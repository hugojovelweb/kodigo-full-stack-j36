import Image from "next/image";
import { getRecetas } from "@/lib/queries";
import RecetaCard from "@/components/RecetaCard";
export const dynamic = "force-dynamic";

// Server Component: los datos se consultan en el servidor en cada request.
export default async function HomePage() {
  const recetas = await getRecetas();
  const destacada = recetas[0];
  const resto = recetas.slice(1);

  return (
    <div>
      {/* Hero asimétrico: texto a la izquierda, foto destacada desbordando a la derecha */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-16 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-5">
          <p className="text-sm text-sage-light mb-4">
            {recetas.length} recetas · actualizado desde Supabase
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-[1.1] text-ink">
            Recetas con calma, para cocinar todos los días
          </h1>
          <p className="mt-5 text-muted max-w-sm">
            Un recetario sencillo, servido en tiempo real: elige una
            categoría o entra directo a un platillo.
          </p>
        </div>

        {destacada?.imagen_url && (
          <div className="md:col-span-7 md:-mr-10">
            <div className="relative aspect-[16/10] border border-line">
              <Image
                src={destacada.imagen_url}
                alt={destacada.titulo}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
          </div>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-6 md:px-10 pb-24">
        {recetas.length === 0 ? (
          <p className="text-muted">Todavía no hay recetas registradas.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {resto.map((receta) => (
              <RecetaCard key={receta.id} receta={receta} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
