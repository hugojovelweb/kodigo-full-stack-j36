import "server-only";

/**
 * Configuración central de la API.
 *
 * Si tus rutas de Laravel son distintas, SOLO tienes que cambiar `ENDPOINTS`.
 * Contrato asumido (el de la API de la Tarea del Módulo 3):
 *
 *   POST /auth/register      { name, email, password, password_confirmation }
 *   POST /auth/login         { email, password }  → { access_token | token }
 *   POST /auth/logout        (Bearer)
 *   GET  /products           público, paginado ({ data, meta })
 *   GET  /products/{id}      público
 *   POST /orders             (Bearer) { items: [{ product_id, quantity }] }
 *   GET  /orders             (Bearer) historial del usuario
 *   GET  /orders/{id}        (Bearer)
 *   POST /orders/{id}/pay    (Bearer) { payment_method }  → Stripe
 */
export const API_BASE_URL = (
  process.env.BASE_URL ?? "http://localhost:8000/api"
).replace(/\/+$/, "");

export const ENDPOINTS = {
  register: "/auth/register",
  login: "/auth/login",
  logout: "/auth/logout",
  products: "/products",
  product: (id: string | number) => `/products/${id}`,
  orders: "/orders",
  order: (id: string | number) => `/orders/${id}`,
  pay: (id: string | number) => `/orders/${id}/pay`,
} as const;

/** Nombre de la cookie httpOnly que guarda el JWT. */
export const COOKIE_NAME = "ecom_token";

/** Tags de caché usados con fetch() y revalidateTag(). */
export const TAGS = {
  products: "products",
  orders: "orders",
} as const;

export const STRIPE_PAYMENT_METHOD =
  process.env.STRIPE_PAYMENT_METHOD ?? "pm_card_visa";
