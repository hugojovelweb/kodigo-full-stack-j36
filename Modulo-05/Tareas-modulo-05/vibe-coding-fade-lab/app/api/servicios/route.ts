import { NextResponse } from "next/server";
import { manejar } from "@/lib/http";
import { listarServicios, obtenerNegocio } from "@/lib/repositories/catalogo";

// GET /api/servicios
export const GET = manejar(async () => {
  const negocio = await obtenerNegocio();
  const data = await listarServicios(negocio.id);
  return NextResponse.json({ data, total: data.length });
});
