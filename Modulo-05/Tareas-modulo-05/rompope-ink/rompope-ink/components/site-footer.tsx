// Sello Hugo Jovel Web (skill sello-footer): dos líneas, año dinámico, enlace seguro.
export function SiteFooter({ stack }: { stack: string }) {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="site-footer muted small">
      {stack}
      <br />© {currentYear}{" "}
      <a href="https://hugojovelweb.tech/" target="_blank" rel="noopener noreferrer">
        <strong>Hugo Jovel Web</strong>
      </a>
      . Todos los derechos reservados.
    </footer>
  );
}
