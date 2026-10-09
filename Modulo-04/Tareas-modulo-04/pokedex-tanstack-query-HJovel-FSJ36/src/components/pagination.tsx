import Link from "next/link";

/** Server Component: navegación por URL (?page=N), sin JavaScript de cliente. */
export function Pagination({
  page,
  totalPages,
}:
 {
  page: number;
  totalPages: number;
}) 
{
  const windowSize = 2;
  const start = Math.max(1, page - windowSize);
  const end = Math.min(totalPages, page + windowSize);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const href = (p: number) => (p === 1 ? "/" : `/?page=${p}`);

  return (
    <nav className="pagination" aria-label="Paginación">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev">
          ← Anterior
        </Link>
      ) : (
        <span className="pagination__disabled">← Anterior</span>
      )}

      {start > 1 && (
        <>
          <Link href={href(1)}>1</Link>
          {start > 2 && <span aria-hidden>…</span>}
        </>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? "page" : undefined}
          className={p === page ? "pagination__current" : undefined}
        >
          {p}
        </Link>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span aria-hidden>…</span>}
          <Link href={href(totalPages)}>{totalPages}</Link>
        </>
      )}

      {page < totalPages ? (
        <Link href={href(page + 1)} rel="next">
          Siguiente →
        </Link>
      ) : (
        <span className="pagination__disabled">Siguiente →</span>
      )}
    </nav>
  );
}
