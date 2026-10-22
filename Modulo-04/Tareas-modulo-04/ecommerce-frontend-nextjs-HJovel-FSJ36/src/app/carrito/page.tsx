import type { Metadata } from "next";
import { CartView } from "@/components/CartView";

export const metadata: Metadata = { title: "Carrito" };

export default function CarritoPage() {
  return (
    <section>
      <h1 className="mb-6 text-3xl font-bold">Tu carrito</h1>
      <CartView />
    </section>
  );
}
