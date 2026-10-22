"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-store";

/** Vacía el carrito local al llegar a la confirmación de compra. */
export function ClearCart() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
