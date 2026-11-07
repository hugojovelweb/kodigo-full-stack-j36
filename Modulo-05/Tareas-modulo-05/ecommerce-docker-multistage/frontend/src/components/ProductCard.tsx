import Link from "next/link";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/lib/types";
import { AddToCartButton } from "./AddToCartButton";
import { ProductImage } from "./ProductImage";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <Link href={`/productos/${product.id}`} aria-label={`Ver ${product.name}`}>
        <ProductImage src={product.image} alt={product.name} priority={priority} />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="font-semibold text-slate-900">
          <Link href={`/productos/${product.id}`} className="hover:underline">
            {product.name}
          </Link>
        </h2>
        <p className="line-clamp-2 text-sm text-slate-600">{product.description}</p>
        <p className="mt-auto text-lg font-bold text-slate-900">{formatMoney(product.price)}</p>
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
