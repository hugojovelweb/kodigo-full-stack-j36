"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { pokemonDetailOptions } from "@/lib/queries";
import {
  formatId,
  formatName,
  formatStatName,
  officialArtworkUrl,
  typeColor,
} from "@/lib/pokemon-utils";
import { TypeBadge } from "@/components/type-badge";
import { DetailSkeleton } from "@/components/detail-skeleton";

const MAX_STAT = 255;

export function PokemonDetailView({ name }: { name: string }) {
  const { data, isPending, isError, error, refetch, isFetching } = useQuery(
    pokemonDetailOptions(name),
  );

  if (isPending) return <DetailSkeleton />;

  if (isError) {
    return (
      <div role="alert" className="state state--error">
        <p>No se pudo cargar el detalle: {error.message}</p>
        <button type="button" onClick={() => void refetch()} disabled={isFetching}>
          {isFetching ? "Reintentando…" : "Reintentar"}
        </button>
      </div>
    );
  }

  const mainType = data.types[0] ?? "normal";

  return (
    <article className="detail">
      <header className="detail__hero" style={{ borderColor: typeColor(mainType) }}>
        <Image
          src={data.artwork}
          alt={`Arte oficial de ${formatName(data.name)}`}
          width={280}
          height={280}
          priority
          className="detail__artwork"
        />
        <div>
          <p className="detail__id">{formatId(data.id)}</p>
          <h1>{formatName(data.name)}</h1>
          {data.genus && <p className="detail__genus">{data.genus}</p>}
          <div className="badges">
            {data.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
          {data.description && <p className="detail__desc">{data.description}</p>}
          <dl className="facts">
            <div>
              <dt>Altura</dt>
              <dd>{data.heightM} m</dd>
            </div>
            <div>
              <dt>Peso</dt>
              <dd>{data.weightKg} kg</dd>
            </div>
            <div>
              <dt>Exp. base</dt>
              <dd>{data.baseExperience ?? "—"}</dd>
            </div>
          </dl>
        </div>
      </header>

      <section aria-labelledby="stats-title">
        <h2 id="stats-title">Estadísticas base</h2>
        <ul className="stats">
          {data.stats.map((stat) => (
            <li key={stat.name}>
              <span className="stats__label">{formatStatName(stat.name)}</span>
              <span className="stats__value">{stat.value}</span>
              <span className="stats__bar" aria-hidden>
                <span
                  style={{
                    width: `${Math.min(100, (stat.value / MAX_STAT) * 100)}%`,
                    backgroundColor: typeColor(mainType),
                  }}
                />
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="abilities-title">
        <h2 id="abilities-title">Habilidades</h2>
        <ul className="chips">
          {data.abilities.map((ability) => (
            <li key={ability.name}>
              {formatName(ability.name)}
              {ability.isHidden && <small> (oculta)</small>}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="evo-title">
        <h2 id="evo-title">Cadena evolutiva</h2>
        {data.evolutions.length <= 1 ? (
          <p>Este Pokémon no evoluciona.</p>
        ) : (
          <ol className="evolutions">
            {data.evolutions.map((step) => (
              <li key={step.id} data-stage={step.stage}>
                <Link href={`/pokemon/${step.name}`}>
                  <Image
                    src={officialArtworkUrl(step.id)}
                    alt={formatName(step.name)}
                    width={96}
                    height={96}
                  />
                  <span>{formatName(step.name)}</span>
                </Link>
                {step.requirement && <small>{step.requirement}</small>}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="sprites-title">
        <h2 id="sprites-title">Sprites</h2>
        <ul className="sprites">
          {data.sprites.map((sprite) => (
            <li key={sprite.label}>
              <Image
                src={sprite.url}
                alt={`${formatName(data.name)} - ${sprite.label}`}
                width={96}
                height={96}
                className="sprites__img"
              />
              <small>{sprite.label}</small>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
