import type { NextConfig } from "next";

/**
 * Configuración de Next.js 16 (App Router).
 *
 * Se usa el modelo de caché clásico (fetch + `next.tags` + revalidateTag /
 * revalidatePath). No se activa `cacheComponents` para que el comportamiento de
 * loading.tsx, error.tsx y Suspense sea el documentado en la actividad.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
