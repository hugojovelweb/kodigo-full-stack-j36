// SELLO: reemplazar al cierre del pago (solo maquetas de cliente)
// Skill sello-footer — un solo punto del proyecto, visible en todas las páginas.
// Uso en app/layout.tsx (dentro de <body>, después de {children}):
//   import { SiteFooter } from "@/components/site-footer";
//   <SiteFooter stack="Kodigo Full Stack Jr 36 · Docker multi-stage · Next.js 16 · Laravel · MySQL 8" />
export function SiteFooter({ stack }: { stack: string }) {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="site-footer">
      {stack}
      <br />© {currentYear}{" "}
      <a
        href="https://hugojovelweb.tech/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <strong>Hugo Jovel Web</strong>
      </a>
      . Todos los derechos reservados.
    </footer>
  );
}
