import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { carregarFontesEtiquetaPeca, renderEtiquetaPecaImageResponse, type PecaEtiquetaDados } from "@/lib/etiqueta-peca";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [{ data: peca }, { data: config }] = await Promise.all([
    supabase.from("pecas").select<string, PecaEtiquetaDados>("nome, codigo, preco_venda").eq("id", id).maybeSingle(),
    supabase.from("configuracoes").select("logo_url").eq("id", 1).single(),
  ]);

  if (!peca || !config) {
    return NextResponse.json({ error: "Peça não encontrada" }, { status: 404 });
  }

  const fonts = await carregarFontesEtiquetaPeca();
  const nomeSlug = slugify(peca.nome) || "peca";
  const nomeArquivo = `etiqueta-${nomeSlug}.png`;

  return renderEtiquetaPecaImageResponse(peca, config.logo_url, fonts, {
    "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
  });
}
