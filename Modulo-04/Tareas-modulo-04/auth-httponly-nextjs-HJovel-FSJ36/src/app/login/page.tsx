import { SignInForm } from "@/components/auth-forms";

export const metadata = { title: "Iniciar sesión" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <section className="card narrow">
      <h1>Iniciar sesión</h1>
      <SignInForm next={next} />
    </section>
  );
}
