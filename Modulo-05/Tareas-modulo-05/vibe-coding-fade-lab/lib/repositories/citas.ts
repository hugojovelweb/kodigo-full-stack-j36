import { TZ_OFFSET } from "../config.ts";
import { query } from "../db.ts";
import type { CitaDetalle, Intervalo } from "../types.ts";

/** Citas activas del profesional que tocan el dia local indicado. */
export async function ocupadosDelDia(profesionalId: string, fecha: string): Promise<Intervalo[]> {
  const desde = new Date(`${fecha}T00:00:00${TZ_OFFSET}`);
  const hasta = new Date(desde.getTime() + 24 * 60 * 60_000);
  const filas = await query<{ inicio: Date | string; fin: Date | string }>(
    `SELECT inicio, fin FROM citas
      WHERE profesional_id = $1 AND estado <> 'cancelada'
        AND inicio < $3::timestamptz AND fin > $2::timestamptz`,
    [profesionalId, desde.toISOString(), hasta.toISOString()],
  );
  return filas.map((f) => ({ inicio: new Date(f.inicio), fin: new Date(f.fin) }));
}

export interface NuevaCita {
  negocioId: string; servicioId: string; profesionalId: string;
  inicio: Date; fin: Date; clienteNombre: string; clienteTelefono: string;
}

/** Inserta la cita. Si se traslapa, la restriccion citas_sin_traslape lanza el error 23P01 (lo maneja la API como 409). */
export async function crearCita(c: NuevaCita): Promise<string> {
  const filas = await query<{ id: string }>(
    `INSERT INTO citas (negocio_id, servicio_id, profesional_id, inicio, fin, cliente_nombre, cliente_telefono)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [c.negocioId, c.servicioId, c.profesionalId, c.inicio.toISOString(), c.fin.toISOString(), c.clienteNombre, c.clienteTelefono],
  );
  return filas[0].id;
}

const SELECT_DETALLE = `
  SELECT c.id, c.inicio, c.fin, c.estado, c.cliente_nombre, c.cliente_telefono,
         s.nombre AS servicio, p.nombre AS profesional, n.nombre AS negocio, n.whatsapp AS negocio_whatsapp
    FROM citas c
    JOIN servicios s ON s.id = c.servicio_id
    JOIN profesionales p ON p.id = c.profesional_id
    JOIN negocios n ON n.id = c.negocio_id`;

type FilaDetalle = {
  id: string; inicio: Date | string; fin: Date | string; estado: string; cliente_nombre: string; cliente_telefono: string;
  servicio: string; profesional: string; negocio: string; negocio_whatsapp: string;
};

const mapear = (f: FilaDetalle): CitaDetalle => ({
  id: f.id, inicio: new Date(f.inicio), fin: new Date(f.fin), estado: f.estado,
  clienteNombre: f.cliente_nombre, clienteTelefono: f.cliente_telefono,
  servicio: f.servicio, profesional: f.profesional, negocio: f.negocio, negocioWhatsapp: f.negocio_whatsapp,
});

export async function obtenerCita(id: string): Promise<CitaDetalle | null> {
  const filas = await query<FilaDetalle>(`${SELECT_DETALLE} WHERE c.id = $1`, [id]);
  return filas[0] ? mapear(filas[0]) : null;
}

/** Proximas citas del negocio (agenda del dueno). */
export async function listarProximas(negocioId: string, limite = 100): Promise<CitaDetalle[]> {
  const filas = await query<FilaDetalle>(
    `${SELECT_DETALLE} WHERE c.negocio_id = $1 AND c.estado <> 'cancelada' AND c.fin >= now() ORDER BY c.inicio LIMIT $2`,
    [negocioId, limite],
  );
  return filas.map(mapear);
}
