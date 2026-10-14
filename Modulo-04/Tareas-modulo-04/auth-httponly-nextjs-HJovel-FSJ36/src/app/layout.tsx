import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SecureAuth · Next.js + Supabase", template: "%s · SecureAuth" },
  description: "Autenticación segura con cookies httpOnly, Server Actions y proxy en Next.js 16 + Supabase.",
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="es">
      <body>
        <SiteHeader user={user} />
        <main className="container">{children}</main>
        <footer className="site-footer muted small">
          Kodigo Full Stack Jr 36 · Next.js 16 · Supabase · cookies httpOnly
        </footer>
      </body>
    </html>
  );
}
