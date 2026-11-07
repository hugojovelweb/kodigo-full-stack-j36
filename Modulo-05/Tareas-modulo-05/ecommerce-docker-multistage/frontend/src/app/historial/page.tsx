import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { OrdersList, OrdersSkeleton } from "@/components/OrdersList";
import { getToken } from "@/lib/session";

export const metadata: Metadata = { title: "Mis compras" };

export default async function HistorialPage() {
  if (!(await getToken())) redirect("/login?next=/historial");

  return (
    <section>
      <h1 className="mb-6 text-3xl font-bold">Historial de compras</h1>
      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersList />
      </Suspense>
    </section>
  );
}
