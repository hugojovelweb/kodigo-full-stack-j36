import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import RutaCard from "@/components/RutaCard";
import { getRutasByZona, getZonaBySlug, getZonas } from "@/lib/queries";

// ISR: se regenera en segundo plano cada 60 s
export const revalidate = 60;

// En Next.js 16 `params` es una Promise → hay que hacer await
type Props = { params: Promise<{ slug: string }> };

// SSG: pre-genera en build una página por cada zona existente
export async function generateStaticParams() {
  const zonas = await getZonas();
  return zonas.map((z) => ({ slug: z.slug }));
}

// SEO dinámico: el nombre de la zona como título
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const zona = await getZonaBySlug(slug);
  if (!zona) return { title: "Zona no encontrada" };
  return {
    title: zona.nombre,
    description: zona.descripcion ?? `Rutas y miradores de la zona ${zona.nombre}.`,
  };
}

// Patrón de 5 pasos: leer parámetro → buscar entidad principal →
// si no existe, notFound() → consultar relacionados → renderizar
export default async function ZonaPage({ params }: Props) {
  const { slug } = await params; // 1. leer el parámetro

  const zona = await getZonaBySlug(slug); // 2. buscar la entidad principal
  if (!zona) notFound(); // 3. si no existe → 404 personalizada

  const rutas = await getRutasByZona(zona.id); // 4. consultar las rutas relacionadas

  // 5. renderizar
  return (
    <div className="space-y-10">
      <Link href="/" className="text-sm text-stone-500 hover:text-teal-700">
        &larr; Volver al inicio
      </Link>

      <header className="space-y-3 rounded-3xl bg-teal-50 px-8 py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Zona</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-stone-800">{zona.nombre}</h1>
        {zona.descripcion && (
          <p className="max-w-2xl text-lg text-stone-700">{zona.descripcion}</p>
        )}
        <p className="text-sm text-stone-500">
          {rutas.length} {rutas.length === 1 ? "ruta" : "rutas"}
        </p>
      </header>

      {rutas.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
          Todavía no hay rutas registradas en esta zona.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rutas.map((r) => (
            <RutaCard key={r.id} ruta={r} />
          ))}
        </div>
      )}
    </div>
  );
}
