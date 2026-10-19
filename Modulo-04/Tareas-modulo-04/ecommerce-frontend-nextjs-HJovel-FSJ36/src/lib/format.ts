const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
export const formatMoney = (n: number) => money.format(n);

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : new Intl.DateTimeFormat("es-SV", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

/** Evita open-redirects: solo rutas internas ("/algo", nunca "//host"). */
export function safeNext(value: FormDataEntryValue | string | null | undefined): string {
  const v = typeof value === "string" ? value : "";
  return v.startsWith("/") && !v.startsWith("//") ? v : "/productos";
}
