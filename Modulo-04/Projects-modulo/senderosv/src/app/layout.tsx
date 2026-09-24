import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SenderoSV", template: "%s | SenderoSV" },
  description: "Rutas y miradores de El Salvador, con toda la información para salir a caminar.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-stone-50 text-stone-900">
        <header className="border-b border-stone-200 bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-xl font-extrabold text-teal-700">
              SenderoSV
            </Link>
            <div className="flex gap-6 text-sm font-medium text-stone-700">
              <Link href="/#zonas" className="hover:text-teal-700">
                Zonas
              </Link>
              <Link href="/#rutas" className="hover:text-teal-700">
                Rutas
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
        <footer className="border-t border-stone-200 py-6 text-center text-sm text-stone-500">
          Hecho con Next.js 16 + Supabase - Kodigo Academy 2026 <br /> <strong>Hugo Jovel Web.</strong>
        </footer>
      </body>
    </html>
  );
}
