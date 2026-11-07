import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-5xl font-extrabold text-indigo-700">404</h1>
      <p className="mt-3 text-slate-600">No encontramos lo que buscas.</p>
      <Link href="/productos" className="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700">
        Volver al catálogo
      </Link>
    </div>
  );
}
