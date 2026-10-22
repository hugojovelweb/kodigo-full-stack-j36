import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { safeNext } from "@/lib/format";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = safeNext(Array.isArray(sp.next) ? sp.next[0] : sp.next);
  return <AuthForm mode="login" next={next} />;
}
