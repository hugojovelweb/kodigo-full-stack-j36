import { PAGE_SIZE } from "@/lib/constants";

export default function Loading() {
  return (
    <section aria-busy="true" aria-live="polite">
      <div className="page-head">
        <h1>Pokédex</h1>
        <p>Cargando Pokémon…</p>
      </div>
      <ul className="grid">
        {Array.from({ length: PAGE_SIZE }, (_, i) => (
          <li key={i}>
            <div className="skeleton skeleton--card" />
          </li>
        ))}
      </ul>
    </section>
  );
}
