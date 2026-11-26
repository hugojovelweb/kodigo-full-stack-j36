import { ANTICIPACION_MIN, DIAS_ADELANTE, PASO_MIN } from "./config.ts";
import { diaSemana, esFechaValida, hoyLocal, sumarDias } from "./fechas.ts";
import { listarHorarios, listarProfesionales, listarServicios } from "./repositories/catalogo.ts";
import { ocupadosDelDia } from "./repositories/citas.ts";
import { generarSlots } from "./slots.ts";

export type ResultadoDisponibilidad =
  | { ok: true; slots: string[]; duracionMin: number }
  | { ok: false; motivo: "fecha_invalida" | "fuera_de_rango" | "no_encontrado" };

/** Regla de negocio unica: la usan GET /api/disponibilidad y POST /api/citas (el servidor siempre revalida). */
export async function slotsDisponibles(p: { negocioId: string; profesionalId: string; servicioId: string; fecha: string }): Promise<ResultadoDisponibilidad> {
  if (!esFechaValida(p.fecha)) return { ok: false, motivo: "fecha_invalida" };
  const hoy = hoyLocal();
  if (p.fecha < hoy || p.fecha > sumarDias(hoy, DIAS_ADELANTE)) return { ok: false, motivo: "fuera_de_rango" };

  const [servicios, profesionales, horarios] = await Promise.all([
    listarServicios(p.negocioId), listarProfesionales(p.negocioId), listarHorarios(p.negocioId),
  ]);
  const servicio = servicios.find((s) => s.id === p.servicioId);
  if (!servicio || !profesionales.some((x) => x.id === p.profesionalId)) return { ok: false, motivo: "no_encontrado" };

  const horario = horarios.find((h) => h.diaSemana === diaSemana(p.fecha));
  if (!horario) return { ok: true, slots: [], duracionMin: servicio.duracionMin }; // dia cerrado

  const ocupados = await ocupadosDelDia(p.profesionalId, p.fecha);
  const slots = generarSlots({
    fecha: p.fecha, abre: horario.abre, cierra: horario.cierra, duracionMin: servicio.duracionMin,
    ocupados, ahora: new Date(), pasoMin: PASO_MIN, anticipacionMin: ANTICIPACION_MIN,
  });
  return { ok: true, slots, duracionMin: servicio.duracionMin };
}
