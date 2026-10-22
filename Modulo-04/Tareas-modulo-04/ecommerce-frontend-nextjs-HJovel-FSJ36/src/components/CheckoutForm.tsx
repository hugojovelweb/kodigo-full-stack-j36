"use client";

import Link from "next/link";
import { useActionState } from "react";
import { checkoutAction } from "@/app/actions/orders";
import { useCart } from "@/lib/cart-store";
import { formatMoney } from "@/lib/format";
import type { FormState } from "@/lib/types";
import { SubmitButton } from "./SubmitButton";

const initial: FormState = {};

export function CheckoutForm() {
  const { items, total } = useCart();
  const [state, action] = useActionState(checkoutAction, initial);

  if (items.length === 0 && !state.orderId) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-700">
        No tienes productos para pagar.{" "}
        <Link
          href="/productos"
          className="font-semibold text-indigo-700 underline"
        >
          Ir al catálogo
        </Link>
      </p>
    );
  }

  // Solo ids y cantidades: el precio lo calcula la API.
  const payload = JSON.stringify(
    items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
  );

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <input type="hidden" name="items" value={payload} />
      <input type="hidden" name="orderId" value={state.orderId ?? ""} />

      <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {items.map((i) => (
          <li key={i.id} className="flex justify-between p-4">
            <span>
              {i.name} <span className="text-slate-500">× {i.quantity}</span>
            </span>
            <span className="font-semibold">
              {formatMoney(i.price * i.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <aside className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold">Pago con Stripe</h2>
        <p className="text-sm text-slate-600">
          Modo de pruebas: se usa la tarjeta de prueba{" "}
          <strong>4242 4242 4242 4242</strong>.
        </p>
        <p className="flex justify-between text-lg font-bold">
          <span>Total estimado</span>
          <span>{formatMoney(total)}</span>
        </p>
        {state.message && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {state.message}
          </p>
        )}
        {/* {state.errors && (
          <ul className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {Object.entries(state.errors).map(([campo, msgs]) => (
              <li key={campo}>
                <strong>{campo}:</strong> {msgs.join(" ")}
              </li>
            ))}
          </ul>
        )} */}
        <SubmitButton className="w-full" pendingText="Procesando pago…">
          {state.orderId ? "Reintentar pago" : "Crear orden y pagar"}
        </SubmitButton>
      </aside>
    </form>
  );
}
