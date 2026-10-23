import { OrdersSkeleton } from "@/components/OrdersList";

export default function Loading() {
  return (
    <section>
      <div className="mb-6 h-9 w-64 animate-pulse rounded bg-slate-200" />
      <OrdersSkeleton />
    </section>
  );
}
