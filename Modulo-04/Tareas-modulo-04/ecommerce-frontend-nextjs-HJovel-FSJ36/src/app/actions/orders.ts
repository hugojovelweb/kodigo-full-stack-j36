"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { ApiError, apiFetch } from "@/lib/api";
import { ENDPOINTS, STRIPE_PAYMENT_METHOD, TAGS } from "@/lib/config";
import { extractOrderId } from "@/lib/data";
import type { FormState } from "@/lib/types";

type CartLine = { product_id: number; quantity: number };

function parseItems(raw: FormDataEntryValue | null): CartLine[] | null {
  try {
    const data = JSON.parse(String(raw ?? "[]"));
    if (!Array.isArray(data) || data.length === 0 || data.length > 50) return null;
    const lines = data.map((i) => ({
      product_id: Number(i?.product_id),
      quantity: Number(i?.quantity),
    }));
    const ok = lines.every(
      (l) =>
        Number.isInteger(l.product_id) &&
        l.product_id > 0 &&
        Number.isInteger(l.quantity) &&
        l.quantity >= 1 &&
        l.quantity <= 99,
    );
    return ok ? lines : null;
  } catch {
    return null;
  }
}

/**
 * Mutación principal: crea la orden y ejecuta el pago (Stripe) en el servidor.
 *
 * - Solo se envían ids y cantidades: los PRECIOS los calcula la API (nunca
 *   confiar en precios enviados por el navegador).
 * - Si la orden se creó pero el pago falló, se devuelve `orderId` y el
 *   formulario reintenta SOLO el pago (sin duplicar la orden).
 * - Al terminar se invalidan caché y rutas para evitar UI desactualizada.
 */
export async function checkoutAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  let orderId = String(formData.get("orderId") ?? "");

  if (!orderId) {
    const items = parseItems(formData.get("items"));
    if (!items) return { message: "El carrito está vacío o es inválido." };

    try {
      const created = await apiFetch(ENDPOINTS.orders, {
        method: "POST",
        auth: true,
        body: { items },
      });
      const id = extractOrderId(created);
      if (!id) return { message: "La API no devolvió el id de la orden." };
      orderId = id;
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) redirect("/login?next=/checkout");
      return {
        message: e instanceof ApiError ? e.message : "No se pudo crear la orden.",
        errors: e instanceof ApiError ? e.errors : undefined,
      };
    }
  }

  try {
    await apiFetch(ENDPOINTS.pay(orderId), {
      method: "POST",
      auth: true,
      body: { payment_method: STRIPE_PAYMENT_METHOD },
    });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect("/login?next=/checkout");
    // La orden existe: la guardamos para reintentar solo el pago.
    revalidatePath("/historial");
    return {
      orderId,
      message:
        (e instanceof ApiError ? e.message : "El pago falló.") +
        ` Tu orden #${orderId} quedó creada; puedes reintentar el pago.`,
    };
  }

  // Evitar interfaces desactualizadas: stock del catálogo + historial + detalle.
  revalidateTag(TAGS.products, "max");
  revalidatePath("/productos", "layout");
  revalidatePath("/historial");
  redirect(`/checkout/exito?orden=${encodeURIComponent(orderId)}`);
}
