import os from "node:os";
import { connection } from "next/server";

// Datos de ejecución reales (se evalúan por petición, no en el build).
// Dentro de Docker, "hostname" es el ID del contenedor.
export async function RuntimeInfo() {
  await connection();

  const rows: [string, string][] = [
    ["Hostname (ID del contenedor)", os.hostname()],
    ["Node.js", process.version],
    ["Sistema", `${process.platform} / ${process.arch}`],
    ["NODE_ENV", process.env.NODE_ENV ?? "—"],
    ["Usuario del proceso", os.userInfo().username],
  ];

  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
          <dd className="font-mono break-all">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
