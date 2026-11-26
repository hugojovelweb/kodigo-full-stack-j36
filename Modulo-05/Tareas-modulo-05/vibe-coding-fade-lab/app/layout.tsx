import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { obtenerNegocio } from "@/lib/repositories/catalogo";

// El layout lee el negocio de la base de datos: se renderiza bajo demanda (no en el build).
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const n = await obtenerNegocio();
  return {
    title: { default: `${n.nombre} · Reserva tu cita`, template: `%s · ${n.nombre}` },
    description: `${n.eslogan} Reserva en línea en segundos.`,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#121316" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const negocio = await obtenerNegocio();
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-30 focus:rounded focus:bg-lima focus:p-2 focus:text-fondo">Saltar al contenido</a>
        <SiteHeader nombre={negocio.nombre} />
        <main id="contenido" className="mx-auto max-w-5xl px-4 py-10">{children}</main>
        <SiteFooter stack="Kodigo Full Stack Jr 36 · Next.js 16 · TypeScript · Tailwind CSS 4 · Neon Postgres · Vercel" />
      </body>
    </html>
  );
}
