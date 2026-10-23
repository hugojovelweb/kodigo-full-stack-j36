import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductImage } from "@/components/ProductImage";
import { getProduct } from "@/lib/data";
import { formatMoney } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/productos/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id).catch(() => null);
  return { title: product?.name ?? "Producto" };
}

export default async function ProductoPage({ params }: PageProps<"/productos/[id]">) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <article className="grid gap-8 md:grid-cols-2">
      <ProductImage src={product.image} alt={product.name} priority className="rounded-2xl" />
      <div className="space-y-4">
        <Link href="/productos" className="text-sm text-indigo-700 hover:underline">← Volver al catálogo</Link>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-2xl font-extrabold">{formatMoney(product.price)}</p>
        <p className="text-slate-700">{product.description}</p>
        <p className="text-sm text-slate-600">
          {product.stock === null ? "Disponible" : product.stock > 0 ? `${product.stock} en stock` : "Agotado"}
        </p>
        <div className="max-w-xs"><AddToCartButton product={product} /></div>
      </div>
    </article>
  );
}
