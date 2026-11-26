import { NextResponse } from "next/server";
import { manejar } from "@/lib/http";
import { listarProfesionales, obtenerNegocio } from "@/lib/repositories/catalogo";

// GET /api/profesionales
export const GET = manejar(async () => {
  const negocio = await obtenerNegocio();
  const data = await listarProfesionales(negocio.id);
  return NextResponse.json({ data, total: data.length });
});
