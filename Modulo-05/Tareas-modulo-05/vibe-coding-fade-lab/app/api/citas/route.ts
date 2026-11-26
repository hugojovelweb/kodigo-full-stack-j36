import { NextResponse } from "next/server";
import { TZ_OFFSET } from "@/lib/config";
import { slotsDisponibles } from "@/lib/disponibilidad";
import { manejar } from "@/lib/http";
import { obtenerNegocio } from "@/lib/repositories/catalogo";
import { crearCita, listarProximas } from "@/lib/repositories/citas";
import { validarReserva } from "@/lib/validacion";

const OCUPADO = { error: "Ese horario ya no está disponible. Elige otro." };

// POST /api/citas -> crea la cita. El servidor valida, revalida la disponibilidad y la BD impide traslapes.
export const POST = manejar(async (req) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "El cuerpo debe ser JSON válido." }, { status: 400 });
  }

  const v = validarReserva(body);
  if (!v.ok) return NextResponse.json(v.error, { status: 422 });
  const d = v.data;

  const negocio = await obtenerNegocio();
  const r = await slotsDisponibles({ negocioId: negocio.id, servicioId: d.servicioId, profesionalId: d.profesionalId, fecha: d.fecha });
  if (!r.ok) {
    return NextResponse.json({ error: r.motivo === "no_encontrado" ? "Servicio o profesional no encontrado." : "Fecha fuera del rango de reserva." }, { status: r.motivo === "no_encontrado" ? 404 : 400 });
  }
  if (!r.slots.includes(d.hora)) return NextResponse.json(OCUPADO, { status: 409 });

  const inicio = new Date(`${d.fecha}T${d.hora}:00${TZ_OFFSET}`);
  const fin = new Date(inicio.getTime() + r.duracionMin * 60_000);
  try {
    const id = await crearCita({
      negocioId: negocio.id, servicioId: d.servicioId, profesionalId: d.profesionalId,
      inicio, fin, clienteNombre: d.nombre, clienteTelefono: d.telefono,
    });
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (e) {
    // 23P01 = exclusion_violation: otra persona reservo ese horario en el mismo instante.
    if ((e as { code?: string }).code === "23P01") return NextResponse.json(OCUPADO, { status: 409 });
    throw e;
  }
});

// GET /api/citas -> agenda del dueño. Requiere la cabecera x-admin-key (ADMIN_API_KEY en .env.local).
export const GET = manejar(async (req) => {
  const clave = process.env.ADMIN_API_KEY;
  if (!clave || req.headers.get("x-admin-key") !== clave) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const negocio = await obtenerNegocio();
  return NextResponse.json({ data: await listarProximas(negocio.id) });
});
