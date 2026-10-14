import Link from "next/link";

export default function NotFound() {
  return (
    <section className="card narrow">
      <h1>404 · Página no encontrada</h1>
      <Link className="btn" href="/">Volver al inicio</Link>
    </section>
  );
}
