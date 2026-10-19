"use client";

import { useCallback, useSyncExternalStore } from "react";

export type CartItem = {
  id: number;
  name: string;
  price: number; // solo para mostrar; la API calcula el total real
  image: string | null;
  quantity: number;
};

const KEY = "ecom_cart_v1";
const EMPTY: CartItem[] = [];
const listeners = new Set<() => void>();
let lastRaw: string | null = null;
let cache: CartItem[] = EMPTY;

function read(): CartItem[] {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return cache;
  }
  if (raw !== lastRaw) {
    lastRaw = raw;
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      cache = Array.isArray(parsed) && parsed.length ? parsed : EMPTY;
    } catch {
      cache = EMPTY;
    }
  }
  return cache;
}

function write(items: CartItem[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    cache = items; // sin localStorage: estado en memoria
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key === KEY && cb();
  window.addEventListener("storage", onStorage); // sincroniza pestañas
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

/** Carrito en estado local (localStorage + useSyncExternalStore). */
export function useCart() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);

  const add = useCallback((item: Omit<CartItem, "quantity">, qty = 1) => {
    const current = read();
    const found = current.find((i) => i.id === item.id);
    write(
      found
        ? current.map((i) =>
            i.id === item.id ? { ...i, quantity: Math.min(99, i.quantity + qty) } : i,
          )
        : [...current, { ...item, quantity: qty }],
    );
  }, []);

  const setQuantity = useCallback((id: number, quantity: number) => {
    const q = Math.max(1, Math.min(99, Math.floor(quantity) || 1));
    write(read().map((i) => (i.id === id ? { ...i, quantity: q } : i)));
  }, []);

  const remove = useCallback((id: number) => {
    write(read().filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => write([]), []);

  const count = items.reduce((n, i) => n + i.quantity, 0);
  const total = items.reduce((n, i) => n + i.quantity * i.price, 0);

  return { items, count, total, add, setQuantity, remove, clear };
}
