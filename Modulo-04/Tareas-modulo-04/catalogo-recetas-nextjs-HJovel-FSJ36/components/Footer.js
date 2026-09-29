export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-line mt-24">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="font-display italic text-lg text-ink">Cocina de Barrio</p>

        <div className="flex flex-col sm:items-end gap-1 text-sm text-muted">
          <p>
            Proyecto académico — Kodigo Full Stack Jr 36 · Next.js App Router + Supabase
          </p>
          <p className="text-xs">
            © {currentYear} <strong>Hugo Jovel Web</strong>. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}