import "./globals.css";
import { Fraunces, Work_Sans } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata = {
  title: "Cocina de Barrio — Catálogo de Recetas",
  description:
    "Landing page de recetas construida con Next.js App Router y Supabase — proyecto académico Kodigo Full Stack Jr 36.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${fraunces.variable} ${workSans.variable}`}>
      <body className="min-h-screen flex flex-col bg-bg text-ink font-sans antialiased">
        <Header />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
