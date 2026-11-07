import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import "./globals.css";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: { default: "TiendaKodigo — E-commerce", template: "%s · TiendaKodigo" },
  description:
    "Frontend e-commerce en Next.js 16 que consume la API REST (Laravel 12 + Stripe). Actividad Kodigo Full Stack Jr 36.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col">
        {/* Header lee la cookie de sesión: se aísla en Suspense para no bloquear el resto. */}
        <Suspense fallback={<div className="h-15.25 border-b bg-white" />}>
          <Header />
        </Suspense>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <SiteFooter stack="Kodigo Full Stack Jr 36 · Next.js 16 · Laravel 12 · Stripe · cookies httpOnly" />
      </body>
    </html>
  );
}
