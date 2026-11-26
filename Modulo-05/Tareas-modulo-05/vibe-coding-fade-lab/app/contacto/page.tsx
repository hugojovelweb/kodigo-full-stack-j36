import type { Metadata } from "next";
import { DIAS_LARGOS } from "@/lib/fechas";
import { listarHorarios, obtenerNegocio } from "@/lib/repositories/catalogo";

export const metadata: Metadata = { title: "Contacto" };

export default async function ContactoPage() {
  const negocio = await obtenerNegocio();
  const horarios = await listarHorarios(negocio.id);
  const tabla = DIAS_LARGOS.map((dia, i) => ({ dia, h: horarios.find((x) => x.diaSemana === i) }));
  const wa = negocio.whatsapp.replace(/\D/g, "");

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <section>
        <h1 className="font-display text-4xl font-extrabold">Contacto</h1>
        <dl className="mt-6 space-y-4">
          <div><dt className="text-sm text-tenue">Dirección</dt><dd className="font-semibold">{negocio.direccion}</dd></div>
          <div><dt className="text-sm text-tenue">WhatsApp</dt>
            <dd><a className="font-semibold text-lima hover:underline" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">+{wa} (número de ejemplo)</a></dd>
          </div>
        </dl>
      </section>
      <section aria-labelledby="horario">
        <h2 id="horario" className="font-display text-2xl font-extrabold">Horario</h2>
        <ul className="mt-4 divide-y divide-borde rounded-2xl border border-borde bg-superficie">
          {tabla.map(({ dia, h }) => (
            <li key={dia} className="flex justify-between px-4 py-3 text-sm">
              <span>{dia}</span>
              <span className={h ? "font-semibold" : "text-tenue"}>{h ? `${h.abre} – ${h.cierra}` : "Cerrado"}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
