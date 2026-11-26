import { TZ } from "./config";

const partes = (f: string) => f.split("-").map(Number) as [number, number, number];

/** Fecha de hoy (YYYY-MM-DD) en la zona horaria del negocio. */
export function hoyLocal(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(ahora);
}

export function esFechaValida(f: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f)) return false;
  const [y, m, d] = partes(f);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function sumarDias(f: string, n: number): string {
  const [y, m, d] = partes(f);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** 0 = domingo ... 6 = sabado (aritmetica pura, independiente de la zona horaria del equipo). */
export function diaSemana(f: string): number {
  const [y, m, d] = partes(f);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export const DIAS_LARGOS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
export const DIAS_CORTOS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

export function formatearFechaLarga(f: string): string {
  const [y, m, d] = partes(f);
  return new Intl.DateTimeFormat("es", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Fecha y hora locales (zona del negocio) de un instante. */
export function partesLocales(d: Date): { fecha: string; hora: string } {
  const hora = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
  return { fecha: hoyLocal(d), hora };
}

export function formatearPrecio(centavos: number): string {
  return `$${(centavos / 100).toFixed(2)}`;
}
