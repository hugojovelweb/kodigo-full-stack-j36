import Link from "next/link";
import Image from "next/image";

export default function RecetaCard({ receta, priority = false }) {
  return (
    <Link
      href={`/recetas/${receta.slug}`}
      className="group relative block aspect-[4/5] overflow-hidden border border-line bg-surface"
    >
      {receta.imagen_url && (
        <Image
          src={receta.imagen_url}
          alt={receta.titulo}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      )}

      {/* Degradado inferior: el título vive sobre la foto, no en una caja aparte */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg/95 via-bg/10 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="flex items-center gap-3 text-xs text-ink/80 mb-2">
          <span>{receta.tiempo_preparacion} min</span>
          <span className="h-1 w-1 rounded-full bg-rust" />
          <span>{receta.dificultad}</span>
        </div>
        <h3 className="font-display text-xl leading-snug text-ink">
          {receta.titulo}
        </h3>
        {receta.categorias?.nombre && (
          <p className="mt-1 text-xs text-sage-light">{receta.categorias.nombre}</p>
        )}
      </div>
    </Link>
  );
}
