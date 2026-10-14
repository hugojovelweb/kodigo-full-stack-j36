import { SignUpForm } from "@/components/auth-forms";

export const metadata = { title: "Crear cuenta" };

export default function SignUpPage() {
  return (
    <section className="card narrow">
      <h1>Crear cuenta</h1>
      <SignUpForm />
    </section>
  );
}
