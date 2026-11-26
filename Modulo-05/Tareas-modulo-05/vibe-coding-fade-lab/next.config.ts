import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" solo se activa al construir la imagen Docker (el Dockerfile define DOCKER_BUILD=1).
  output: process.env.DOCKER_BUILD === "1" ? "standalone" : undefined,
};

export default nextConfig;
