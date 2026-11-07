export default function Loading() {
  return (
    <section aria-busy="true" aria-label="Cargando checkout">
      <div className="mb-6 h-9 w-64 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="h-48 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-56 animate-pulse rounded-xl bg-slate-200" />
      </div>
    </section>
  );
}
