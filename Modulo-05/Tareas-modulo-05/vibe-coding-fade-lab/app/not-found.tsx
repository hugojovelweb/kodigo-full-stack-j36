import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-10 text-center">
      <p className="font-display text-7xl font-extrabold text-lima">404</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold">No encontramos esa página</h1>
      <Link href="/" className="mt-6 inline-block rounded-full bg-lima px-5 py-2 font-bold text-fondo hover:bg-lima-oscuro">Volver al inicio</Link>
    </div>
  );
}
