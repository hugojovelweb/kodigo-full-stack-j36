import Link from "next/link";
import { TIPOS_NEGOCIO } from "@/lib/config";
import { formatearPrecio } from "@/lib/fechas";
import { listarProfesionales, listarServicios, obtenerNegocio } from "@/lib/repositories/catalogo";

// Server Component: consulta Neon en el servidor, sin JavaScript extra en el navegador.
export default async function Home() {
  const negocio = await obtenerNegocio();
  const [servicios, equipo] = await Promise.all([listarServicios(negocio.id), listarProfesionales(negocio.id)]);
  const tipo = TIPOS_NEGOCIO[negocio.tipo];

  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden rounded-3xl border border-borde bg-superficie px-6 py-14 sm:px-12 sm:py-20">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-lima/20 blur-3xl" />
        <p className="aparecer text-xs font-bold uppercase tracking-[0.3em] text-lima">{tipo.etiqueta} · {negocio.nombre}</p>
        <h1 className="aparecer mt-4 max-w-2xl font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl">{tipo.titulo}</h1>
        <p className="aparecer mt-5 max-w-xl text-lg text-tenue">{negocio.eslogan} Elige servicio, profesional y horario. Sin llamadas, sin esperas.</p>
        <div className="aparecer mt-8 flex flex-wrap items-center gap-4">
          <Link href="/reservar" className="rounded-full bg-lima px-7 py-3.5 font-bold text-fondo transition hover:bg-lima-oscuro">{tipo.cta} →</Link>
          <Link href="/servicios" className="rounded-full border border-borde px-7 py-3.5 font-semibold transition hover:border-lima hover:text-lima">Ver servicios</Link>
        </div>
        <dl className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-borde pt-6">
          <div><dt className="text-xs text-tenue">Servicios</dt><dd className="font-display text-3xl font-extrabold">{servicios.length}</dd></div>
          <div><dt className="text-xs text-tenue">Profesionales</dt><dd className="font-display text-3xl font-extrabold">{equipo.length}</dd></div>
          <div><dt className="text-xs text-tenue">Reserva en</dt><dd className="font-display text-3xl font-extrabold">1 min</dd></div>
        </dl>
      </section>

      <section aria-labelledby="populares">
        <div className="flex items-end justify-between gap-4">
          <h2 id="populares" className="font-display text-3xl font-extrabold">Lo más pedido</h2>
          <Link href="/servicios" className="text-sm font-semibold text-lima hover:underline">Ver todo →</Link>
        </div>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {servicios.slice(0, 3).map((s, i) => (
            <li key={s.id} className="group rounded-2xl border border-borde bg-superficie p-5 transition hover:-translate-y-1 hover:border-lima">
              <span className="font-display text-sm font-bold text-lima">0{i + 1}</span>
              <h3 className="mt-2 font-display text-xl font-bold">{s.nombre}</h3>
              <p className="mt-1 text-sm text-tenue">{s.descripcion}</p>
              <p className="mt-4 flex items-center justify-between text-sm"><span className="text-tenue">{s.duracionMin} min</span><strong className="text-lg">{formatearPrecio(s.precioCentavos)}</strong></p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="como" className="rounded-3xl border border-borde p-6 sm:p-10">
        <h2 id="como" className="font-display text-3xl font-extrabold">Así de fácil</h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-4">
          {["Elige tu servicio", "Escoge tu profesional", "Selecciona día y hora", "Confirma con tus datos"].map((t, i) => (
            <li key={t}><span className="grid h-9 w-9 place-items-center rounded-full bg-lima font-bold text-fondo">{i + 1}</span><p className="mt-3 font-semibold">{t}</p></li>
          ))}
        </ol>
      </section>
    </div>
  );
}
