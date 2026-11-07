import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ClearCart } from "@/components/ClearCart";
import { getOrder } from "@/lib/data";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Compra confirmada" };

async function OrderSummary({ id }: { id: string }) {
  const order = await getOrder(id);
  if (!order) return null;
  return (
    <div className="mx-auto mt-6 max-w-sm rounded-xl border border-slate-200 bg-white p-5 text-left">
      <p className="flex justify-between"><span>Estado</span><strong className="uppercase">{order.status}</strong></p>
      <p className="mt-2 flex justify-between"><span>Total</span><strong>{formatMoney(order.total)}</strong></p>
    </div>
  );
}

export default async function ExitoPage({ searchParams }: PageProps<"/checkout/exito">) {
  const sp = await searchParams;
  const orden = String(Array.isArray(sp.orden) ? sp.orden[0] : (sp.orden ?? ""));

  return (
    <section className="py-10 text-center">
      <ClearCart />
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl" aria-hidden="true">✓</div>
      <h1 className="mt-4 text-3xl font-bold">¡Compra confirmada!</h1>
      <p className="mt-2 text-slate-600">
        {orden ? <>Tu orden <strong>#{orden}</strong> fue pagada correctamente.</> : "Tu pago fue procesado correctamente."}
      </p>
      {orden && (
        <Suspense fallback={<div className="mx-auto mt-6 h-20 max-w-sm animate-pulse rounded-xl bg-slate-200" />}>
          <OrderSummary id={orden} />
        </Suspense>
      )}
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/historial" className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700">Ver mis compras</Link>
        <Link href="/productos" className="rounded-lg border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-100">Seguir comprando</Link>
      </div>
    </section>
  );
}
