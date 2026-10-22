"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import type { Product } from "@/lib/types";

export function AddToCartButton({ product }: { product: Product }) {
  const { add, items } = useCart();
  const [added, setAdded] = useState(false);
  const inCart = items.find((i) => i.id === product.id)?.quantity ?? 0;
  const soldOut = product.stock !== null && product.stock <= 0;

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={soldOut}
        onClick={() => {
          add({ id: product.id, name: product.name, price: product.price, image: product.image });
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
        className="rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {soldOut ? "Agotado" : added ? "¡Agregado!" : "Agregar al carrito"}
      </button>
      {inCart > 0 && (
        <span className="text-xs text-slate-600" aria-live="polite">
          {inCart} en tu carrito
        </span>
      )}
    </div>
  );
}
