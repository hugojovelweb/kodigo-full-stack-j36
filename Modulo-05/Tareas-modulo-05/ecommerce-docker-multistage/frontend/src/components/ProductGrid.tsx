import Link from "next/link";
import { getProducts } from "@/lib/data";
import { ProductCard } from "./ProductCard";

/**
 * Sección "pesada" de datos: Server Component async. Se envuelve en <Suspense>
 * en las páginas para hacer streaming del HTML mientras llega la API.
 */
export async function ProductGrid({ page = 1, limit }: { page?: number; limit?: number }) {
  const { items, lastPage } = await getProducts(page);
  const shown = limit ? items.slice(0, limit) : items;

  if (shown.length === 0) {
    return <p className="rounded-lg bg-slate-100 p-6 text-slate-600">No hay productos disponibles todavía.</p>;
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((p, i) => (
          <ProductCard key={p.id} product={p} priority={i < 2} />
        ))}
      </div>
      {!limit && lastPage > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Paginación">
          {page > 1 && (
            <Link className="rounded-lg border px-4 py-2 hover:bg-slate-100" href={`/productos?page=${page - 1}`}>
              ← Anterior
            </Link>
          )}
          <span className="text-sm text-slate-600">
            Página {page} de {lastPage}
          </span>
          {page < lastPage && (
            <Link className="rounded-lg border px-4 py-2 hover:bg-slate-100" href={`/productos?page=${page + 1}`}>
              Siguiente →
            </Link>
          )}
        </nav>
      )}
    </>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Cargando productos">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="aspect-4/3 animate-pulse bg-slate-200" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-5 w-1/3 animate-pulse rounded bg-slate-200" />
            <div className="h-10 animate-pulse rounded-lg bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
