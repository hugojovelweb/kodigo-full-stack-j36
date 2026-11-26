import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatearFechaLarga, partesLocales } from "@/lib/fechas";
import { obtenerCita } from "@/lib/repositories/citas";
import { esUuid } from "@/lib/validacion";

export const metadata: Metadata = { title: "Reserva confirmada", robots: { index: false } };

// Server Component con ruta dinamica: lee la cita desde Neon por su UUID.
export default async function ReservaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!esUuid(id)) notFound();
  const cita = await obtenerCita(id);
  if (!cita) notFound();

  const { fecha, hora } = partesLocales(cita.inicio);
  const cuando = `${formatearFechaLarga(fecha)} a las ${hora}`;
  const mensaje = `Hola, soy ${cita.clienteNombre}. Reservé ${cita.servicio} con ${cita.profesional} el ${cuando}.`;
  const wa = cita.negocioWhatsapp.replace(/\D/g, "");

  return (
    <div className="mx-auto max-w-lg text-center">
      <div aria-hidden className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-lima text-3xl font-extrabold text-fondo">✓</div>
      <h1 className="mt-5 font-display text-4xl font-extrabold">¡Reserva confirmada!</h1>
      <p className="mt-2 text-tenue">Te esperamos en {cita.negocio}.</p>
      <dl className="mt-8 divide-y divide-borde rounded-2xl border border-borde bg-superficie text-left">
        {[["Servicio", cita.servicio], ["Profesional", cita.profesional], ["Cuándo", cuando], ["A nombre de", cita.clienteNombre]].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 px-5 py-3"><dt className="text-tenue">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>
        ))}
      </dl>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href={`https://wa.me/${wa}?text=${encodeURIComponent(mensaje)}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-lima px-6 py-3 font-bold text-fondo hover:bg-lima-oscuro">Avisar por WhatsApp</a>
        <Link href="/" className="rounded-full border border-borde px-6 py-3 font-semibold hover:border-lima hover:text-lima">Volver al inicio</Link>
      </div>
      <p className="mt-6 text-xs text-tenue">Guarda este enlace: es tu comprobante de reserva.</p>
    </div>
  );
}
