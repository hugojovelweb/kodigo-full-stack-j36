import "server-only";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "./config";

const SEVEN_DAYS = 60 * 60 * 24 * 7;

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE_NAME)?.value;
}

/**
 * Guarda el JWT en una cookie httpOnly: JavaScript del navegador NO puede
 * leerla (protege contra robo por XSS). sameSite=lax mitiga CSRF.
 */
export async function setToken(token: string): Promise<void> {
  const secure =
    process.env.COOKIE_SECURE !== undefined
      ? process.env.COOKIE_SECURE === "true"
      : process.env.NODE_ENV === "production";

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: SEVEN_DAYS,
  });
}

export async function clearToken(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}
