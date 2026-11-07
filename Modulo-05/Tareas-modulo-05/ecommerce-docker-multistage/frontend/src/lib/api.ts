import "server-only";
import { API_BASE_URL } from "./config";
import { getToken } from "./session";

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Adjunta `Authorization: Bearer <token>` leído de la cookie httpOnly. */
  auth?: boolean;
  /** Tags de caché (solo lecturas públicas) para revalidateTag(). */
  tags?: string[];
  /** Segundos de revalidación (ISR de datos). Sin valor = no-store. */
  revalidate?: number;
};

/**
 * Único punto de salida hacia la API. Corre SIEMPRE en el servidor
 * (Server Components y Server Actions), por lo que el token nunca llega
 * al bundle del navegador.
 */
export async function apiFetch<T = unknown>(
  path: string,
  { method = "GET", body, auth = false, tags, revalidate }: ApiOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = await getToken();
    if (!token) throw new ApiError("Debes iniciar sesión.", 401);
    headers.Authorization = `Bearer ${token}`;
  }

  const init: RequestInit & { next?: { tags?: string[]; revalidate?: number } } =
    {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    };

  // Solo las lecturas públicas se cachean. Lo autenticado va siempre
  // no-store para no mezclar datos entre usuarios.
  if (method === "GET" && !auth && (tags || revalidate)) {
    init.next = { tags, revalidate };
  } else {
    init.cache = "no-store";
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, init);
  } catch {
    throw new ApiError(
      "No se pudo conectar con la API. Verifica que esté encendida y que BASE_URL sea correcta.",
      503,
    );
  }

  const json = (await res.json().catch(() => null)) as
    | (Record<string, unknown> & {
        message?: string;
        errors?: Record<string, string[]>;
      })
    | null;

  if (!res.ok) {
    throw new ApiError(
      json?.message ?? `La API respondió con error ${res.status}.`,
      res.status,
      json?.errors,
    );
  }
  return json as T;
}
