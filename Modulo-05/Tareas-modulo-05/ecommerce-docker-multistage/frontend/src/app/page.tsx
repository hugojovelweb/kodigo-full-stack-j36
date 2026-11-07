import Link from "next/link";
import { Suspense } from "react";
import { ProductGrid, ProductGridSkeleton } from "@/components/ProductGrid";

export const dynamic = "force-dynamic";


export default function Home() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-indigo-700 px-6 py-12 text-white">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Compra rápido, seguro y sin esperas</h1>
        <p className="mt-3 max-w-xl text-indigo-100">
          Catálogo público, carrito local, órdenes y pago con Stripe consumiendo tu API de Laravel.
        </p>
        <Link href="/productos" className="mt-6 inline-block rounded-lg bg-white px-5 py-2.5 font-semibold text-indigo-700 hover:bg-indigo-50">
          Ver catálogo completo
        </Link>
      </section>

      <section aria-labelledby="destacados">
        <h2 id="destacados" className="mb-4 text-2xl font-bold">Destacados</h2>
        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          <ProductGrid limit={4} />
        </Suspense>
      </section>
    </div>
  );
}
