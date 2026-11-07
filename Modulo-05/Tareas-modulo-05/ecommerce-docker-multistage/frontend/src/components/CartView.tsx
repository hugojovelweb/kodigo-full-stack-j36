"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { formatMoney } from "@/lib/format";
import { ProductImage } from "./ProductImage";

export function CartView() {
  const { items, total, count, setQuantity, remove, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">
        <p className="text-lg text-slate-700">Tu carrito está vacío.</p>
        <Link href="/productos" className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700">
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {items.map((i) => (
          <li key={i.id} className="flex items-center gap-4 p-4">
            <ProductImage src={i.image} alt={i.name} className="!aspect-square !w-20 rounded-lg" />
            <div className="flex-1">
              <p className="font-semibold text-slate-900">{i.name}</p>
              <p className="text-sm text-slate-600">{formatMoney(i.price)} c/u</p>
              <div className="mt-2 flex items-center gap-2">
                <label htmlFor={`q-${i.id}`} className="sr-only">Cantidad de {i.name}</label>
                <input
                  id={`q-${i.id}`}
                  type="number"
                  min={1}
                  max={99}
                  value={i.quantity}
                  onChange={(e) => setQuantity(i.id, Number(e.target.value))}
                  className="w-20 rounded-lg border border-slate-300 px-2 py-1"
                />
                <button type="button" onClick={() => remove(i.id)} className="text-sm font-medium text-red-600 hover:underline">
                  Quitar
                </button>
              </div>
            </div>
            <p className="font-bold">{formatMoney(i.price * i.quantity)}</p>
          </li>
        ))}
      </ul>
      <aside className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold">Resumen</h2>
        <p className="flex justify-between text-slate-700"><span>Artículos</span><span>{count}</span></p>
        <p className="flex justify-between text-lg font-bold"><span>Total estimado</span><span>{formatMoney(total)}</span></p>
        <Link href="/checkout" className="block rounded-lg bg-indigo-600 px-4 py-2.5 text-center font-semibold text-white hover:bg-indigo-700">
          Continuar al pago
        </Link>
        <button type="button" onClick={clear} className="w-full text-sm text-slate-600 hover:underline">
          Vaciar carrito
        </button>
      </aside>
    </div>
  );
}
