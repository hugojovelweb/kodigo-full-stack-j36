"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";

export function CartLink() {
  const { count } = useCart();
  return (
    <Link
      href="/carrito"
      className="relative rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
    >
      Carrito
      <span
        className="ml-1.5 inline-flex min-w-5 justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-bold text-white"
        suppressHydrationWarning
      >
        {count}
      </span>
    </Link>
  );
}
