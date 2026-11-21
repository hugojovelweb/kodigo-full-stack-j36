/** @type {import('next').NextConfig} */
const nextConfig = {
  // "standalone" solo dentro de Docker (imagen pequeña). En Amplify se usa el build normal.
  output: process.env.DOCKER_BUILD === "1" ? "standalone" : undefined,
  poweredByHeader: false,
};

export default nextConfig;
