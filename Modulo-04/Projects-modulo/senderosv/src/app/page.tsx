import Link from "next/link";
import FiltroDificultad from "@/components/FiltroDificultad";
import { getRutas, getZonas } from "@/lib/queries";

// ISR: la página es estática y se regenera en segundo plano cada 60 s
export const revalidate = 60;

export default async function HomePage() {
  const [zonas, rutas] = await Promise.all([getZonas(), getRutas()]);

  return (
    <div className="space-y-16">
      <section className="rounded-3xl bg-teal-50 px-8 py-16 text-center">
        <h1 className="text-xl font-extrabold text-teal-700 sm:text-3xl md:text-4xl">
          SenderoSV
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-stone-700">
          Rutas y miradores de El Salvador, con distancia, dificultad y duración.
        </p>
        <a
          href="#rutas"
          className="mt-8 inline-block rounded-full bg-teal-700 px-8 py-3 font-semibold text-white transition hover:bg-teal-800"
        >
          Ver rutas
        </a>
      </section>

      {/* RETO: cada tarjeta de zona ahora es un enlace a /zonas/[slug] */}
      <section id="zonas" className="scroll-mt-8">
        <h2 className="mb-6 text-2xl font-bold">Zonas</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {zonas.map((z) => (
            <Link
              key={z.id}
              href={`/zonas/${z.slug}`}
              className="rounded-2xl border border-stone-200 bg-white p-6 transition hover:-translate-y-1 hover:border-teal-700 hover:shadow-lg"
            >
              <h3 className="text-lg font-bold text-stone-900">{z.nombre}</h3>
              <p className="mt-1 text-sm text-stone-600">{z.descripcion}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="rutas" className="scroll-mt-8">
        <h2 className="mb-6 text-2xl font-bold">Todas las rutas</h2>
        {/* Extensión opcional: filtro por dificultad (Client Component) */}
        <FiltroDificultad rutas={rutas} />
      </section>
    </div>
  );
}
