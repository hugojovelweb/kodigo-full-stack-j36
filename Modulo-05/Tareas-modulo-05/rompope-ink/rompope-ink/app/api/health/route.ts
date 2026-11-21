import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Corre en el SERVIDOR: demuestra que las variables de entorno de producción llegan al runtime.
export function GET() {
  return NextResponse.json({
    status: "ok",
    studio: process.env.NEXT_PUBLIC_STUDIO_NAME ?? "(sin definir)",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "(sin definir)",
    whatsappConfigured: Boolean(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER),
    node: process.version,
    time: new Date().toISOString(),
  });
}
