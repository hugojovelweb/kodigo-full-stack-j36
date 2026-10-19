import "server-only";
import { apiFetch, ApiError } from "./api";
import { ENDPOINTS, TAGS } from "./config";
import type { Order, OrderItem, Paginated, Product } from "./types";

/* ───────── Normalizadores (toleran variaciones de la API Laravel) ───────── */

type Json = Record<string, unknown>;
const isObj = (v: unknown): v is Json =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const num = (v: unknown, fallback = 0) => {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : fallback;
};

/** Laravel: { data: [...] } | { data: { data: [...] } } | [...] */
function extractList(json: unknown): Json[] {
  if (Array.isArray(json)) return json.filter(isObj);
  if (isObj(json)) {
    for (const key of ["data", "products", "orders", "items"]) {
      const v = json[key];
      if (Array.isArray(v)) return v.filter(isObj);
      if (isObj(v)) return extractList(v);
    }
  }
  return [];
}

function extractObject(json: unknown): Json {
  if (isObj(json)) {
    for (const key of ["data", "product", "order"]) {
      if (isObj(json[key])) return json[key] as Json;
    }
    return json;
  }
  return {};
}

function extractMeta(json: unknown): { page: number; lastPage: number } {
  if (!isObj(json)) return { page: 1, lastPage: 1 };
  const meta = (isObj(json.meta) ? json.meta : isObj(json.data) ? json.data : json) as Json;
  return {
    page: num(meta.current_page, 1),
    lastPage: Math.max(1, num(meta.last_page, 1)),
  };
}

export function toProduct(p: Json): Product {
  return {
    id: num(p.id),
    name: String(p.name ?? p.title ?? "Producto"),
    description: String(p.description ?? ""),
    price: num(p.price),
    stock: p.stock === undefined || p.stock === null ? null : num(p.stock),
    image:
      (p.image_url as string) ?? (p.image as string) ?? (p.thumbnail as string) ?? null,
  };
}

function toOrderItem(i: Json): OrderItem {
  const product = isObj(i.product) ? i.product : {};
  return {
    id: (i.id as number | string) ?? (i.product_id as number | string) ?? "",
    name: String(i.name ?? i.product_name ?? product.name ?? "Producto"),
    quantity: num(i.quantity, 1),
    price: num(i.unit_price ?? i.price ?? product.price),
  };
}

export function toOrder(o: Json): Order {
  const items = Array.isArray(o.items)
    ? o.items
    : Array.isArray(o.order_items)
      ? o.order_items
      : [];
  return {
    id: (o.id as number | string) ?? "",
    status: String(o.status ?? "pending"),
    total: num(o.total ?? o.total_amount),
    createdAt: (o.created_at as string) ?? null,
    items: items.filter(isObj).map(toOrderItem),
  };
}

/* ───────── Lecturas (Server Components) ───────── */

/** Catálogo público: cacheado 60 s y etiquetado para revalidateTag("products"). */
export async function getProducts(page = 1): Promise<Paginated<Product>> {
  const json = await apiFetch(`${ENDPOINTS.products}?page=${page}`, {
    tags: [TAGS.products],
    revalidate: 60,
  });
  return { items: extractList(json).map(toProduct), ...extractMeta(json) };
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const json = await apiFetch(ENDPOINTS.product(id), {
      tags: [TAGS.products, `product-${id}`],
      revalidate: 60,
    });
    return toProduct(extractObject(json));
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

/** Historial: autenticado → siempre no-store (datos por usuario). */
export async function getOrders(): Promise<Order[]> {
  const json = await apiFetch(ENDPOINTS.orders, { auth: true });
  return extractList(json).map(toOrder);
}

export async function getOrder(id: string): Promise<Order | null> {
  try {
    const json = await apiFetch(ENDPOINTS.order(id), { auth: true });
    return toOrder(extractObject(json));
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export function extractToken(json: unknown): string | null {
  if (!isObj(json)) return null;
  const data = isObj(json.data) ? json.data : {};
  const auth = isObj(json.authorization) ? json.authorization : {};
  const t =
    json.access_token ?? json.token ?? data.access_token ?? data.token ?? auth.token;
  return typeof t === "string" && t ? t : null;
}

export function extractOrderId(json: unknown): string | null {
  const o = extractObject(json);
  const id = o.id ?? (isObj(o.order) ? o.order.id : undefined);
  return id !== undefined && id !== null ? String(id) : null;
}
