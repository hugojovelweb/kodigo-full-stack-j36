import { SignInForm } from "@/components/auth-forms";

export const metadata = { title: "Iniciar sesión" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; verified?: string; reset?: string }>;
}) {
  const { next, verified, reset } = await searchParams;
  return (
    <section className="card narrow">
      <h1>Iniciar sesión</h1>
      {verified === "1" && <p className="notice success" role="status">Correo confirmado. Ya puedes iniciar sesión.</p>}
      {reset === "1" && <p className="notice success" role="status">Contraseña actualizada. Inicia sesión con la nueva.</p>}
      <SignInForm next={next} />
    </section>
  );
}
