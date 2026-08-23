import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SIGO Oficina",
    short_name: "SIGO Oficina",
    description: "Sistema de gestão para oficina de conserto de eletrodomésticos",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f9fb",
    theme_color: "#00647c",
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png" },
      { src: "/icon-512", sizes: "512x512", type: "image/png" },
    ],
  };
}
