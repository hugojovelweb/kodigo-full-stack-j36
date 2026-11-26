import { esFechaValida } from "./fechas.ts";
import type { ApiError, ReservaInput } from "./types.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TEL = /^[0-9+\-\s()]{8,20}$/;
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export const esUuid = (v: string) => UUID.test(v);

export function validarReserva(body: unknown): { ok: true; data: ReservaInput } | { ok: false; error: ApiError } {
  const b = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;
  const s = (k: string) => (typeof b[k] === "string" ? (b[k] as string).trim() : "");
  const campos: NonNullable<ApiError["campos"]> = {};

  const data: ReservaInput = {
    servicioId: s("servicioId"), profesionalId: s("profesionalId"), fecha: s("fecha"),
    hora: s("hora"), nombre: s("nombre"), telefono: s("telefono"),
  };

  if (!UUID.test(data.servicioId)) campos.servicioId = "Elige un servicio.";
  if (!UUID.test(data.profesionalId)) campos.profesionalId = "Elige un profesional.";
  if (!esFechaValida(data.fecha)) campos.fecha = "Elige una fecha válida.";
  if (!HORA.test(data.hora)) campos.hora = "Elige una hora.";
  if (data.nombre.length < 3 || data.nombre.length > 80) campos.nombre = "Escribe tu nombre (mínimo 3 letras).";
  if (!TEL.test(data.telefono)) campos.telefono = "Teléfono no válido (8 a 20 dígitos).";

  if (Object.keys(campos).length > 0) return { ok: false, error: { error: "Revisa los campos marcados.", campos } };
  return { ok: true, data };
}
