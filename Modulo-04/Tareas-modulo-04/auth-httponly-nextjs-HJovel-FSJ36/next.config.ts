import type { NextConfig } from "next";

/**
 * Cabeceras de seguridad estáticas. La Content-Security-Policy (con nonce por
 * petición) se genera en src/proxy.ts porque necesita un valor distinto en
 * cada respuesta.
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  experimental: {
    serverActions: {
      // Defensa CSRF adicional: Next ya compara Origin vs Host en cada Server Action;
      // aquí se declaran explícitamente los orígenes permitidos (opcional).
      allowedOrigins: process.env.NEXT_PUBLIC_SITE_URL
        ? [new URL(process.env.NEXT_PUBLIC_SITE_URL).host]
        : [],
      bodySizeLimit: "100kb",
    },
  },
};

export default nextConfig;
