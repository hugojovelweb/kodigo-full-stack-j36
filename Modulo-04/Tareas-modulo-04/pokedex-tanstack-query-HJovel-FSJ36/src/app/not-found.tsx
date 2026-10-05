import Link from "next/link";

export default function NotFound() {
  return (
    <div className="state">
      <h1>404 · No encontrado</h1>
      <p>Ese Pokémon (o esa página) no existe.</p>
      <Link href="/">Volver a la Pokédex</Link>
    </div>
  );
}
