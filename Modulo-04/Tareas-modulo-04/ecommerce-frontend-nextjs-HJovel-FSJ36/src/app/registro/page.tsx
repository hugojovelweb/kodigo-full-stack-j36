import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { safeNext } from "@/lib/format";

export const metadata: Metadata = { title: "Registro" };

export default async function RegistroPage({ searchParams }: PageProps<"/registro">) {
  const sp = await searchParams;
  const next = safeNext(Array.isArray(sp.next) ? sp.next[0] : sp.next);
  return <AuthForm mode="register" next={next} />;
}
