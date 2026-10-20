import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Padrão é 1mb — baixo demais para uma foto tirada direto do celular
    // (upload de logo, ícone de veículo etc. via Server Action).
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
