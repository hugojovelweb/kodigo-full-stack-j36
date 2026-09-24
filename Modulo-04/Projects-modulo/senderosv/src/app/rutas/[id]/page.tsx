import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRutaById, getRutas } from "@/lib/queries";

export const revalidate = 60;

// En Next.js 16 `params` es una Promise → hay que hacer await
type Props = { params: Promise<{ id: string }> };

// SSG: genera en build una página por cada ruta existente
export async function generateStaticParams() {
  const rutas = await getRutas();
  return rutas.map((r) => ({ id: String(r.id) }));
}

// SEO dinámico: título y descripción distintos por ruta
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const ruta = Number.isInteger(Number(id)) ? await getRutaById(Number(id)) : null;
  if (!ruta) return { title: "Ruta no encontrada" };
  return { title: ruta.nombre, description: ruta.descripcion };
}

export default async function RutaPage({ params }: Props) {
  const { id } = await params;
  const rutaId = Number(id);
  if (!Number.isInteger(rutaId)) notFound();

  const ruta = await getRutaById(rutaId);
  if (!ruta) notFound();

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <Link href="/" className="text-sm text-stone-500 hover:text-teal-700">
        &larr; Volver al inicio
      </Link>

      <div className="relative aspect-video overflow-hidden rounded-3xl bg-stone-100">
        {ruta.imagen_url && (
          <Image
            src={ruta.imagen_url}
            alt={ruta.nombre}
            fill
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        )}
      </div>

      <header className="space-y-3">
        {ruta.zonas && (
          // Este enlace apunta a /zonas/[slug] (construido en el Reto).
          <Link
            href={`/zonas/${ruta.zonas.slug}`}
            className="text-sm font-semibold uppercase tracking-wide text-teal-700 hover:underline"
          >
            {ruta.zonas.nombre}
          </Link>
        )}
        <h1 className="text-4xl font-extrabold">{ruta.nombre}</h1>
        <p className="text-lg text-stone-600">{ruta.descripcion}</p>
        <p className="text-sm text-stone-500">
          {ruta.distancia_km} km - {ruta.duracion_horas} h - {ruta.elevacion_m} m -{" "}
          {ruta.dificultad}
        </p>
      </header>
    </article>
  );
}
