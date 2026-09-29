import Link from "next/link";
import { getCategorias } from "@/lib/queries";

export default async function Header() {
  const categorias = await getCategorias();

  return (
    <header className="sticky top-0 z-20 bg-bg/85 backdrop-blur-md border-b border-line">
      <div className="max-w-6xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between gap-6">
        <Link
          href="/"
          className="font-display italic text-2xl tracking-tight text-ink shrink-0"
        >
          Cocina de Barrio
        </Link>

        <nav className="hidden sm:flex items-center gap-8 text-sm">
          <Link href="/" className="nav-link text-ink/90 hover:text-ink transition-colors">
            Todas las recetas
          </Link>
          {categorias.map((cat) => (
            <Link
              key={cat.id}
              href={`/categorias/${cat.slug}`}
              className="nav-link text-ink/90 hover:text-ink transition-colors"
            >
              {cat.nombre}
            </Link>
          ))}
        </nav>

        <span className="hidden sm:inline-block h-2 w-2 rounded-full bg-rust shrink-0" />
      </div>

      {/* Menú simple para móvil: mismos enlaces, apilados debajo del header */}
      <nav className="sm:hidden flex items-center gap-5 overflow-x-auto px-6 pb-4 text-sm">
        <Link href="/" className="text-ink/90 whitespace-nowrap">
          Todas
        </Link>
        {categorias.map((cat) => (
          <Link
            key={cat.id}
            href={`/categorias/${cat.slug}`}
            className="text-ink/90 whitespace-nowrap"
          >
            {cat.nombre}
          </Link>
        ))}
      </nav>
    </header>
  );
}
