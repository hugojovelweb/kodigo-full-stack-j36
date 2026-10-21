import { getOrders } from "@/lib/data";
import { formatDate, formatMoney } from "@/lib/format";

const STATUS: Record<string, string> = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-800",
};

/** Sección pesada del historial: Server Component async dentro de <Suspense>. */
export async function OrdersList() {
  const orders = await getOrders();

  if (orders.length === 0) {
    return <p className="rounded-xl bg-slate-100 p-6 text-slate-600">Aún no tienes compras.</p>;
  }

  return (
    <ul className="space-y-4">
      {orders.map((o) => (
        <li key={o.id} className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-bold text-slate-900">Orden #{o.id}</p>
              <p className="text-sm text-slate-600">{formatDate(o.createdAt)}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${STATUS[o.status.toLowerCase()] ?? "bg-slate-100 text-slate-700"}`}>
              {o.status}
            </span>
            <p className="text-lg font-bold">{formatMoney(o.total)}</p>
          </div>
          {o.items.length > 0 && (
            <ul className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-700">
              {o.items.map((i, idx) => (
                <li key={`${i.id}-${idx}`}>{i.name} × {i.quantity}</li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

export function OrdersSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Cargando historial">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200" />
      ))}
    </div>
  );
}
