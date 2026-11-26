// Loading UI global (App Router): se muestra mientras una ruta del servidor consulta la base de datos.
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="animate-pulse space-y-4">
      <div className="h-10 w-2/3 rounded-lg bg-superficie-2" />
      <div className="h-4 w-full rounded bg-superficie" />
      <div className="h-4 w-5/6 rounded bg-superficie" />
      <div className="grid gap-3 sm:grid-cols-2"><div className="h-28 rounded-2xl bg-superficie" /><div className="h-28 rounded-2xl bg-superficie" /></div>
      <span className="sr-only">Cargando…</span>
    </div>
  );
}
