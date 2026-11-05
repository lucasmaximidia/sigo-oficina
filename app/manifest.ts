import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SIGO Oficina",
    short_name: "SIGO Oficina",
    description: "Sistema de gestão para oficina de conserto de eletrodomésticos",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f4f0",
    theme_color: "#202522",
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png" },
      { src: "/icon-512", sizes: "512x512", type: "image/png" },
    ],
  };
}
