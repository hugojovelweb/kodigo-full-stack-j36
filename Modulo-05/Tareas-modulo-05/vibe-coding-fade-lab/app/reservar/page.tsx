import type { Metadata } from "next";
import { ReservaWizard } from "@/components/reserva-wizard";
import { DIAS_ADELANTE } from "@/lib/config";
import { listarHorarios, listarProfesionales, listarServicios, obtenerNegocio } from "@/lib/repositories/catalogo";

export const metadata: Metadata = { title: "Reservar" };

// Server Component: carga el catalogo desde Neon y se lo pasa al asistente (Client Component).
export default async function ReservarPage() {
  const negocio = await obtenerNegocio();
  const [servicios, profesionales, horarios] = await Promise.all([
    listarServicios(negocio.id), listarProfesionales(negocio.id), listarHorarios(negocio.id),
  ]);
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-4xl font-extrabold">Reserva tu cita</h1>
      <p className="mb-8 mt-2 text-tenue">Cuatro pasos y listo. Tu horario se confirma al instante.</p>
      <ReservaWizard servicios={servicios} profesionales={profesionales} diasAbiertos={horarios.map((h) => h.diaSemana)} diasAdelante={DIAS_ADELANTE} />
    </div>
  );
}
