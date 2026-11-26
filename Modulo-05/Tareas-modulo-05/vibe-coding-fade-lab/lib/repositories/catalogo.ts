import { query } from "../db.ts";
import type { Horario, Negocio, Profesional, Servicio, TipoNegocio } from "../types.ts";

// Repositorio de lectura del catalogo. Si manana cambia la fuente de datos, solo cambia este archivo.

export async function obtenerNegocio(): Promise<Negocio> {
  const slug = process.env.NEGOCIO_SLUG ?? "fade-lab";
  const filas = await query<{ id: string; slug: string; nombre: string; tipo: TipoNegocio; eslogan: string; whatsapp: string; direccion: string }>(
    "SELECT id, slug, nombre, tipo, eslogan, whatsapp, direccion FROM negocios WHERE slug = $1",
    [slug],
  );
  if (filas.length === 0) {
    throw new Error(`No existe el negocio "${slug}". Ejecuta npm run db:setup para crear las tablas y los datos de ejemplo.`);
  }
  return filas[0];
}

export async function listarServicios(negocioId: string): Promise<Servicio[]> {
  const filas = await query<{ id: string; nombre: string; descripcion: string; duracion_min: number; precio_centavos: number }>(
    "SELECT id, nombre, descripcion, duracion_min, precio_centavos FROM servicios WHERE negocio_id = $1 AND activo ORDER BY orden, nombre",
    [negocioId],
  );
  return filas.map((f) => ({ id: f.id, nombre: f.nombre, descripcion: f.descripcion, duracionMin: f.duracion_min, precioCentavos: f.precio_centavos }));
}

export async function listarProfesionales(negocioId: string): Promise<Profesional[]> {
  return query<Profesional>(
    "SELECT id, nombre, especialidad, bio FROM profesionales WHERE negocio_id = $1 AND activo ORDER BY orden, nombre",
    [negocioId],
  );
}

export async function listarHorarios(negocioId: string): Promise<Horario[]> {
  const filas = await query<{ dia_semana: number; abre: string; cierra: string }>(
    "SELECT dia_semana, abre::text AS abre, cierra::text AS cierra FROM horarios WHERE negocio_id = $1 ORDER BY dia_semana",
    [negocioId],
  );
  return filas.map((f) => ({ diaSemana: Number(f.dia_semana), abre: f.abre.slice(0, 5), cierra: f.cierra.slice(0, 5) }));
}
