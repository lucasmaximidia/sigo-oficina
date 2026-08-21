import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { supabase } from "@/lib/supabase";
import { RelatorioPdf, type RelatorioLinha } from "@/components/financeiro/relatorio-pdf";
import { formaPagamentoLabel } from "@/lib/relatorio-financeiro";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface OsRelatorioRow {
  id: string;
  data_entrada: string;
  data_finalizacao: string | null;
  data_pagamento: string | null;
  valor_mao_obra: number;
  valor_frete: number;
  desconto: number;
  forma_pagamento: string | null;
  clientes: { nome: string } | null;
  equipamentos: { tipo: string; marca: string | null; modelo: string | null } | null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const inicio = url.searchParams.get("inicio");
  const fim = url.searchParams.get("fim");
  const colunasParam = url.searchParams.get("colunas");

  if (!inicio || !fim) {
    return NextResponse.json({ error: "Informe o período (inicio e fim)" }, { status: 400 });
  }
  const colunasSelecionadas = colunasParam ? colunasParam.split(",") : [];

  const [{ data: ordens }, { data: config }] = await Promise.all([
    supabase
      .from("ordens_servico")
      .select<string, OsRelatorioRow>(
        "id, data_entrada, data_finalizacao, data_pagamento, valor_mao_obra, valor_frete, desconto, forma_pagamento, clientes(nome), equipamentos(tipo, marca, modelo)"
      )
      .eq("status", "finalizado")
      .gte("data_finalizacao", `${inicio}T00:00:00`)
      .lte("data_finalizacao", `${fim}T23:59:59`)
      .order("data_finalizacao", { ascending: true }),
    supabase.from("configuracoes").select("nome_empresa, logo_url").eq("id", 1).single(),
  ]);

  if (!config) {
    return NextResponse.json({ error: "Configurações não encontradas" }, { status: 500 });
  }

  const osIds = (ordens ?? []).map((os) => os.id);
  const { data: itens } = await supabase
    .from("os_itens")
    .select("os_id, descricao, origem, quantidade, valor_unitario")
    .in("os_id", osIds);

  type ItemRelatorio = NonNullable<typeof itens>[number];
  const itensPorOs = new Map<string, ItemRelatorio[]>();
  for (const item of itens ?? []) {
    const lista = itensPorOs.get(item.os_id) ?? [];
    lista.push(item);
    itensPorOs.set(item.os_id, lista);
  }

  const linhas: RelatorioLinha[] = (ordens ?? []).map((os) => {
    const itensDaOs = itensPorOs.get(os.id) ?? [];
    const itensLoja = itensDaOs.filter((i) => i.origem === "loja_parceira");
    const itensOficina = itensDaOs.filter((i) => i.origem === "estoque" || i.origem === "compra_emergencial");

    const valorPecasLoja = itensLoja.reduce((acc, i) => acc + i.quantidade * i.valor_unitario, 0);
    const valorPecasOficina = itensOficina.reduce((acc, i) => acc + i.quantidade * i.valor_unitario, 0);
    const valorTotal = valorPecasLoja + os.valor_mao_obra + valorPecasOficina + os.valor_frete;

    const equipamento = os.equipamentos;
    const produto = equipamento ? [equipamento.marca, equipamento.modelo].filter(Boolean).join(" ") || equipamento.tipo : "—";

    return {
      id: os.id,
      cliente: os.clientes?.nome ?? "—",
      produto,
      data_entrada: os.data_entrada.slice(0, 10),
      valor_pecas_loja: valorPecasLoja,
      mao_obra: os.valor_mao_obra,
      valor_pecas_oficina: valorPecasOficina,
      frete: os.valor_frete,
      pecas_loja_desc: itensLoja.map((i) => i.descricao).join(", ") || "—",
      pecas_oficina_desc: itensOficina.map((i) => i.descricao).join(", ") || "—",
      valor_total: valorTotal,
      valor_com_desconto: Math.max(0, valorTotal - os.desconto),
      data_pagamento: os.data_pagamento ?? (os.data_finalizacao ? os.data_finalizacao.slice(0, 10) : ""),
      forma_pagamento: os.forma_pagamento ? (formaPagamentoLabel[os.forma_pagamento] ?? os.forma_pagamento) : "—",
    };
  });

  const buffer = await renderToBuffer(
    RelatorioPdf({
      linhas,
      colunasSelecionadas,
      config,
      inicio,
      fim,
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="relatorio-financeiro-${inicio}-a-${fim}.pdf"`,
    },
  });
}
