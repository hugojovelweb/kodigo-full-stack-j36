import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/CheckoutForm";
import { getToken } from "@/lib/session";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  // Defensa en profundidad: además del proxy, la página verifica la sesión.
  if (!(await getToken())) redirect("/login?next=/checkout");

  return (
    <section>
      <h1 className="mb-6 text-3xl font-bold">Finalizar compra</h1>
      <CheckoutForm />
    </section>
  );
}
