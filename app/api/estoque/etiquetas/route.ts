import { NextResponse } from "next/server";
import JSZip from "jszip";
import { supabase } from "@/lib/supabase";
import { carregarFontesEtiquetaPeca, renderEtiquetaPecaImageResponse, type PecaEtiquetaDados } from "@/lib/etiqueta-peca";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const ids: string[] = Array.isArray(body?.ids) ? body.ids.filter((id: unknown) => typeof id === "string") : [];

  if (ids.length === 0) {
    return NextResponse.json({ error: "Nenhuma peça selecionada" }, { status: 400 });
  }

  const [{ data: pecas }, { data: config }] = await Promise.all([
    supabase
      .from("pecas")
      .select<string, PecaEtiquetaDados & { id: string }>("id, nome, codigo, preco_venda")
      .in("id", ids),
    supabase.from("configuracoes").select("logo_url").eq("id", 1).single(),
  ]);

  if (!pecas || pecas.length === 0 || !config) {
    return NextResponse.json({ error: "Peças não encontradas" }, { status: 404 });
  }

  // Mantém a ordem em que as peças foram selecionadas na tela.
  const pecasPorId = new Map(pecas.map((peca) => [peca.id, peca]));
  const pecasOrdenadas = ids.map((id) => pecasPorId.get(id)).filter((peca) => peca !== undefined);

  const fonts = await carregarFontesEtiquetaPeca();

  const zip = new JSZip();
  const nomesUsados = new Map<string, number>();

  await Promise.all(
    pecasOrdenadas.map(async (peca) => {
      const imageResponse = renderEtiquetaPecaImageResponse(peca, config.logo_url, fonts);
      const buffer = Buffer.from(await imageResponse.arrayBuffer());

      const base = nomeArquivoEtiqueta(peca);
      const usos = nomesUsados.get(base) ?? 0;
      nomesUsados.set(base, usos + 1);
      const nomeArquivo = usos === 0 ? `${base}.png` : `${base}-${usos + 1}.png`;

      zip.file(nomeArquivo, buffer);
    })
  );

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="etiquetas.zip"`,
    },
  });
}

function nomeArquivoEtiqueta(peca: PecaEtiquetaDados): string {
  const base = peca.codigo?.trim() || peca.nome;
  return slugify(base) || "etiqueta";
}
