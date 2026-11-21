import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "../components/site-footer";

const studio = process.env.NEXT_PUBLIC_STUDIO_NAME ?? "Rompope Ink";

export const metadata: Metadata = {
  title: `${studio} — Estudio de tatuajes`,
  description: `${studio}: tatuajes flash, fine line y blackwork con estética vintage. Agenda tu cita.`,
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <SiteFooter stack="Kodigo Full Stack Jr 36 · Next.js 15 · Docker · AWS Amplify" />
      </body>
    </html>
  );
}
