import type { Metadata } from "next";
import Link from "next/link";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Pokédex · TanStack Query + Next.js",
    template: "%s · Pokédex",
  },
  description:
    "Pokédex construida con Next.js 16 (RSC), TanStack Query v5, prefetching en hover e hidratación desde el servidor.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <header className="site-header">
          <Link href="/" className="site-header__brand">
            ⚡ Pokédex
          </Link>
          <span className="site-header__tag">
            Next.js 16 · TanStack Query v5
          </span>
        </header>
        <main className="container">
          <Providers>{children}</Providers>
        </main>

        <footer className="site-footer">
          <p>
            Datos de <a href="https://pokeapi.co/">PokéAPI</a> · Proyecto Kodigo
            FSJ36
          </p>
          <p>
            <strong>
              © {new Date().getFullYear()} by Hugo Jovel Web. Derechos
              reservados.
            </strong>
          </p>
        </footer>
      </body>
    </html>
  );
}
