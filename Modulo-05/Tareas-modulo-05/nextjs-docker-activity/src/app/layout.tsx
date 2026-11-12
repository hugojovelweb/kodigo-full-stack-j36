import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js + Docker | Contenerización de aplicaciones web",
  description:
    "Aplicación Next.js contenerizada con Docker (multi-stage build) para entornos consistentes, aislados y portables.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <SiteFooter stack="Kodigo Full Stack Jr 36 · Next.js 16 · Docker multi-stage · node:22-alpine" />
      </body>
    </html>
  );
}
