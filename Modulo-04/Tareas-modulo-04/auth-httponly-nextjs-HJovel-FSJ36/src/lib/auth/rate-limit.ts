import "server-only";
import { headers } from "next/headers";
import { sql } from "@/lib/db";

/** IP del cliente (Vercel y la mayoría de proxies inversos escriben x-forwarded-for). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/**
 * Límite de intentos por ventana fija, guardado en Neon (funciona en serverless,
 * donde la memoria no se comparte entre instancias).
 * Devuelve true si la petición está PERMITIDA.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const rows = (await sql()`
    insert into rate_limits (key, count, reset_at)
    values (${key}, 1, now() + make_interval(secs => ${windowSeconds}))
    on conflict (key) do update set
      count    = case when rate_limits.reset_at < now() then 1 else rate_limits.count + 1 end,
      reset_at = case when rate_limits.reset_at < now() then now() + make_interval(secs => ${windowSeconds}) else rate_limits.reset_at end
    returning count`) as unknown as { count: number }[];
  return (rows[0]?.count ?? 1) <= limit;
}

export async function clearRateLimit(key: string) {
  await sql()`delete from rate_limits where key = ${key}`;
}
