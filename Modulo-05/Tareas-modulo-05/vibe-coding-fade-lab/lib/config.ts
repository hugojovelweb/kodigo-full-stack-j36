// Constantes compartidas (seguras para servidor y cliente).
export const TZ = "America/El_Salvador";
export const TZ_OFFSET = "-06:00"; // El Salvador no usa horario de verano
export const PASO_MIN = 30; // granularidad de los horarios
export const ANTICIPACION_MIN = 30; // no se puede reservar con menos de 30 min de anticipacion
export const DIAS_ADELANTE = 14; // ventana de reserva

// Textos por tipo de negocio: base para escalar a peluquerias y salones sin tocar componentes.
export const TIPOS_NEGOCIO = {
  barberia: { etiqueta: "Barbería", titulo: "Tu mejor versión empieza en la silla.", cta: "Reserva tu corte" },
  peluqueria: { etiqueta: "Peluquería", titulo: "Cabello con actitud, a tu medida.", cta: "Reserva tu cita" },
  salon: { etiqueta: "Salón de belleza", titulo: "Belleza que se siente tuya.", cta: "Reserva tu cita" },
} as const;
