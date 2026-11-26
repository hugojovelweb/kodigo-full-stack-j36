import { NextResponse } from "next/server";

/** Envuelve un Route Handler: cualquier excepcion se registra en el servidor y el cliente recibe un 500 generico (sin filtrar detalles internos). */
export function manejar(fn: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    try {
      return await fn(req);
    } catch (e) {
      console.error("[api]", e);
      return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
    }
  };
}
