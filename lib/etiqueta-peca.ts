import { ImageResponse } from "next/og";
import { EtiquetaPecaImage, ETIQUETA_PECA_LARGURA, ETIQUETA_PECA_ALTURA } from "@/components/estoque/etiqueta-peca-image";

export interface PecaEtiquetaDados {
  nome: string;
  codigo: string | null;
  preco_venda: number;
}

async function loadGoogleFont(family: string, weight: number) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`;
  const css = await (
    await fetch(cssUrl, {
      headers: {
        // User-Agent antigo faz o Google Fonts responder com WOFF (em vez de WOFF2), formato que o Satori consegue ler.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36",
      },
    })
  ).text();
  // O bloco "latin" (unicode-range começando em U+0000-00FF) cobre os acentos
  // do português e é sempre o último @font-face do CSS retornado.
  const matches = [...css.matchAll(/src: url\(([^)]+)\) format\('(?:opentype|truetype|woff)'\)/g)];
  const match = matches.at(-1);
  if (!match) throw new Error("Não foi possível carregar a fonte");
  const response = await fetch(match[1]);
  return response.arrayBuffer();
}

export async function carregarFontesEtiquetaPeca() {
  const [montserratRegular, montserratBold] = await Promise.all([
    loadGoogleFont("Montserrat", 400),
    loadGoogleFont("Montserrat", 700),
  ]);
  return [
    { name: "Montserrat", data: montserratRegular, weight: 400 as const, style: "normal" as const },
    { name: "Montserrat", data: montserratBold, weight: 700 as const, style: "normal" as const },
  ];
}

export function renderEtiquetaPecaImageResponse(
  peca: PecaEtiquetaDados,
  logoUrl: string | null,
  fonts: Awaited<ReturnType<typeof carregarFontesEtiquetaPeca>>,
  headers?: Record<string, string>
) {
  return new ImageResponse(
    EtiquetaPecaImage({
      logoUrl,
      nome: peca.nome,
      codigo: peca.codigo,
      precoVenda: peca.preco_venda,
    }),
    {
      width: ETIQUETA_PECA_LARGURA,
      height: ETIQUETA_PECA_ALTURA,
      fonts,
      headers,
    }
  );
}
