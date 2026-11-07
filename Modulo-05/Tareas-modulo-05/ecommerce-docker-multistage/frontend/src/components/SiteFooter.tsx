export function SiteFooter({ stack }: { stack: string }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
      {stack}
      <br />© {currentYear}{" "}
      <a
        href="https://hugojovelweb.tech/"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        <strong>Hugo Jovel Web</strong>
      </a>
      . Todos los derechos reservados.
    </footer>
  );
}