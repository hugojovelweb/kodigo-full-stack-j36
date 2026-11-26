import type { Intervalo } from "./types.ts";

export interface ParamsSlots {
  fecha: string; // YYYY-MM-DD (dia local del negocio)
  abre: string; // HH:MM
  cierra: string; // HH:MM
  duracionMin: number;
  ocupados: Intervalo[];
  ahora: Date;
  pasoMin?: number;
  anticipacionMin?: number;
  offset?: string; // desfase horario del negocio, ej. "-06:00"
}

/**
 * Funcion pura: devuelve las horas de inicio ("HH:MM") disponibles para un servicio en un dia.
 * Un horario es valido si: cabe dentro del horario de apertura, respeta la anticipacion minima
 * y no se traslapa con citas existentes del profesional.
 */
export function generarSlots(p: ParamsSlots): string[] {
  const paso = p.pasoMin ?? 30;
  const anticipacion = p.anticipacionMin ?? 30;
  const offset = p.offset ?? "-06:00";
  const aMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
  const aHora = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
  const aFecha = (min: number) => new Date(`${p.fecha}T${aHora(min)}:00${offset}`);

  const limite = p.ahora.getTime() + anticipacion * 60_000;
  const resultado: string[] = [];

  for (let t = aMin(p.abre); t + p.duracionMin <= aMin(p.cierra); t += paso) {
    const inicio = aFecha(t);
    const fin = new Date(inicio.getTime() + p.duracionMin * 60_000);
    if (inicio.getTime() < limite) continue;
    if (p.ocupados.some((o) => inicio < o.fin && fin > o.inicio)) continue;
    resultado.push(aHora(t));
  }
  return resultado;
}
