// Sello de footer (skill sello-footer): UN solo punto, visible en todas las paginas (se usa en app/layout.tsx).
export function SiteFooter({ stack }: { stack: string }) {
  const currentYear = new Date().getFullYear();
  return (
    // SELLO: reemplazar al cierre del pago (solo maquetas de cliente)
    <footer className="site-footer mt-20 border-t border-borde px-4 py-8 text-center text-sm text-tenue">
      {stack}
      <br />© {currentYear}{" "}
      <a href="https://hugojovelweb.tech/" target="_blank" rel="noopener noreferrer" className="text-texto underline underline-offset-2 hover:text-lima">
        <strong>Hugo Jovel Web</strong>
      </a>
      . Todos los derechos reservados.
    </footer>
  );
}
