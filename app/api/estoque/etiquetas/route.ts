import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { supabase } from "@/lib/supabase";
import { carregarFontesEtiquetaPeca, renderEtiquetaPecaImageResponse, type PecaEtiquetaDados } from "@/lib/etiqueta-peca";
import { EtiquetasPecasPdf } from "@/components/estoque/etiquetas-pecas-pdf";

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

  const imagensDataUri = await Promise.all(
    pecasOrdenadas.map(async (peca) => {
      const imageResponse = renderEtiquetaPecaImageResponse(peca, config.logo_url, fonts);
      const buffer = Buffer.from(await imageResponse.arrayBuffer());
      return `data:image/png;base64,${buffer.toString("base64")}`;
    })
  );

  const pdfBuffer = await renderToBuffer(EtiquetasPecasPdf({ imagensDataUri }));

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="etiquetas.pdf"`,
    },
  });
}
