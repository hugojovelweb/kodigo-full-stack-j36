import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductGrid, ProductGridSkeleton } from "@/components/ProductGrid";

export const metadata: Metadata = { title: "Catálogo" };

export default async function ProductosPage({ searchParams }: PageProps<"/productos">) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, parseInt(raw ?? "1", 10) || 1);

  return (
    <section>
      <h1 className="mb-6 text-3xl font-bold">Catálogo de productos</h1>
      {/* key=page: al paginar, Suspense vuelve a mostrar el skeleton. */}
      <Suspense key={page} fallback={<ProductGridSkeleton />}>
        <ProductGrid page={page} />
      </Suspense>
    </section>
  );
}
