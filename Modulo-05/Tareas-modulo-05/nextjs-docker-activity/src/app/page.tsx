import { Suspense } from "react";
import { RuntimeInfo } from "@/components/runtime-info";

const buenasPracticas = [
  "Multi-stage build: dependencias, compilación y producción en etapas separadas",
  "Imagen base oficial node:alpine, liviana y apta para producción",
  "Capas ordenadas para aprovechar la caché de Docker (package.json antes del código)",
  ".dockerignore para excluir node_modules, .next, .env y archivos temporales",
  "El proceso corre como usuario no root dentro del contenedor",
  "HEALTHCHECK sobre /api/health",
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <span className="w-fit rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800 dark:bg-sky-950 dark:text-sky-200">
          Actividad práctica · Docker
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Next.js contenerizado con Docker
        </h1>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Entorno de desarrollo consistente, aislado y portable: la misma imagen
          corre igual en Debian, Windows o cualquier servidor con Docker.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Información del contenedor en ejecución</h2>
        <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
          <Suspense fallback={<p className="text-sm text-zinc-500">Cargando datos de ejecución…</p>}>
            <RuntimeInfo />
          </Suspense>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Buenas prácticas aplicadas</h2>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-zinc-700 dark:text-zinc-300">
          {buenasPracticas.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
