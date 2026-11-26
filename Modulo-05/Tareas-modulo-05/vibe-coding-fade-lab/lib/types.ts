export type TipoNegocio = "barberia" | "peluqueria" | "salon";

export interface Negocio { id: string; slug: string; nombre: string; tipo: TipoNegocio; eslogan: string; whatsapp: string; direccion: string }
export interface Servicio { id: string; nombre: string; descripcion: string; duracionMin: number; precioCentavos: number }
export interface Profesional { id: string; nombre: string; especialidad: string; bio: string }
export interface Horario { diaSemana: number; abre: string; cierra: string } // HH:MM
export interface Intervalo { inicio: Date; fin: Date }

export interface CitaDetalle {
  id: string; inicio: Date; fin: Date; estado: string;
  clienteNombre: string; clienteTelefono: string;
  servicio: string; profesional: string; negocio: string; negocioWhatsapp: string;
}

export interface ReservaInput { servicioId: string; profesionalId: string; fecha: string; hora: string; nombre: string; telefono: string }
export interface ApiError { error: string; campos?: Partial<Record<keyof ReservaInput, string>> }
