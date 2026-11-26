import { NextResponse } from "next/server";
import { slotsDisponibles } from "@/lib/disponibilidad";
import { manejar } from "@/lib/http";
import { obtenerNegocio } from "@/lib/repositories/catalogo";
import { esUuid } from "@/lib/validacion";

// GET /api/disponibilidad?servicioId=...&profesionalId=...&fecha=YYYY-MM-DD  -> { data: ["09:00", ...] }
export const GET = manejar(async (req) => {
  const q = new URL(req.url).searchParams;
  const servicioId = q.get("servicioId") ?? "";
  const profesionalId = q.get("profesionalId") ?? "";
  const fecha = q.get("fecha") ?? "";
  if (!esUuid(servicioId) || !esUuid(profesionalId)) {
    return NextResponse.json({ error: "servicioId y profesionalId deben ser UUID válidos." }, { status: 400 });
  }

  const negocio = await obtenerNegocio();
  const r = await slotsDisponibles({ negocioId: negocio.id, servicioId, profesionalId, fecha });
  if (!r.ok) {
    const mensajes = { fecha_invalida: "Fecha no válida.", fuera_de_rango: "La fecha está fuera del rango de reserva.", no_encontrado: "Servicio o profesional no encontrado." };
    return NextResponse.json({ error: mensajes[r.motivo] }, { status: r.motivo === "no_encontrado" ? 404 : 400 });
  }
  return NextResponse.json({ data: r.slots, total: r.slots.length });
});
