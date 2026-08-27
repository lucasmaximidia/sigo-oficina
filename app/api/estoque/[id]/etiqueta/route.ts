import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { EtiquetaPecaImage, ETIQUETA_PECA_LARGURA, ETIQUETA_PECA_ALTURA } from "@/components/estoque/etiqueta-peca-image";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PecaRow {
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

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [{ data: peca }, { data: config }] = await Promise.all([
    supabase.from("pecas").select<string, PecaRow>("nome, codigo, preco_venda").eq("id", id).maybeSingle(),
    supabase.from("configuracoes").select("logo_url").eq("id", 1).single(),
  ]);

  if (!peca || !config) {
    return NextResponse.json({ error: "Peça não encontrada" }, { status: 404 });
  }

  const [montserratRegular, montserratBold] = await Promise.all([
    loadGoogleFont("Montserrat", 400),
    loadGoogleFont("Montserrat", 700),
  ]);

  const nomeSlug = slugify(peca.nome) || "peca";
  const nomeArquivo = `etiqueta-${nomeSlug}.png`;

  return new ImageResponse(
    EtiquetaPecaImage({
      logoUrl: config.logo_url,
      nome: peca.nome,
      codigo: peca.codigo,
      precoVenda: peca.preco_venda,
    }),
    {
      width: ETIQUETA_PECA_LARGURA,
      height: ETIQUETA_PECA_ALTURA,
      fonts: [
        { name: "Montserrat", data: montserratRegular, weight: 400, style: "normal" },
        { name: "Montserrat", data: montserratBold, weight: 700, style: "normal" },
      ],
      headers: {
        "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
      },
    }
  );
}
