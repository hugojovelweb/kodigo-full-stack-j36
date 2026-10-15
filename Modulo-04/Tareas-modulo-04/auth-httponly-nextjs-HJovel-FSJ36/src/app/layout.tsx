import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth/dal";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SecureAuth · Next.js + Neon", template: "%s · SecureAuth" },
  description: "Autenticación segura con cookies httpOnly, Server Actions y proxy en Next.js 16 + Neon Postgres.",
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="es">
      <body>
        <SiteHeader user={user} />
        <main className="container">{children}</main>
        <footer className="site-footer muted small">
          Kodigo Full Stack Jr 36 · Next.js 16 · Neon Postgres · cookies httpOnly
        </footer>
      </body>
    </html>
  );
}
