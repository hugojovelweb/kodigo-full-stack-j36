import { ProductGridSkeleton } from "@/components/ProductGrid";

export default function Loading() {
  return (
    <section>
      <div className="mb-6 h-9 w-72 animate-pulse rounded bg-slate-200" />
      <ProductGridSkeleton />
    </section>
  );
}
