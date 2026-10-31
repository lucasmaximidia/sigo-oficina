import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { FechamentoPdf } from "@/components/financeiro/fechamento-pdf";
import { formaPagamentoLabel } from "@/lib/relatorio-financeiro";
import { retiradaTipoMap } from "@/lib/status";
import { dataBR } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Cada pagamento registrado numa OS (os_pagamentos) é um movimento de caixa
// próprio, datado do dia em que o dinheiro entrou de verdade — inclusive um
// adiantamento numa OS ainda não quitada por completo.
interface PagamentoOsRow {
  data: string;
  forma_pagamento: string;
  valor: number;
  valor_recebido_liquido: number | null;
}

interface FreteRow {
  valor_custo: number;
  status: string;
  data_pagamento: string | null;
  ordens_servico: { numero: number } | null;
  prestadores_frete: { nome: string } | null;
}

interface MovimentoDatado {
  data: string;
  valor: number;
  descricao: string;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const url = new URL(request.url);
  const mes = url.searchParams.get("mes");
  if (!mes || !/^\d{4}-\d{2}$/.test(mes)) {
    return NextResponse.json({ error: "Informe o mês no formato YYYY-MM" }, { status: 400 });
  }

  const [ano, mesNum] = mes.split("-").map(Number);
  const inicioMes = `${mes}-01`;
  const fimMes = new Date(ano, mesNum, 0).toISOString().slice(0, 10);

  const { data: config } = await supabase.from("configuracoes").select("nome_empresa, logo_url").eq("id", 1).single();
  if (!config) {
    return NextResponse.json({ error: "Configurações não encontradas" }, { status: 500 });
  }

  const [
    { data: pagamentosOs },
    { data: vendas },
    { data: despesas },
    { data: contas },
    { data: fretes },
    { data: retiradas },
    { data: ajustes },
  ] = await Promise.all([
    supabase.from("os_pagamentos").select<string, PagamentoOsRow>("data, forma_pagamento, valor, valor_recebido_liquido"),
    supabase.from("vendas_pdv").select("id, created_at, total, forma_pagamento").is("deletado_em", null),
    supabase.from("financeiro_despesas").select("descricao, categoria, valor, data").is("deletado_em", null),
    supabase.from("financeiro_contas").select("descricao, fornecedor, valor, pago_em, status").is("deletado_em", null),
    supabase
      .from("fretes")
      .select<string, FreteRow>("valor_custo, status, data_pagamento, ordens_servico(numero), prestadores_frete(nome)"),
    supabase.from("financeiro_retiradas").select("descricao, tipo, valor, data").is("deletado_em", null),
    supabase.from("financeiro_ajustes_caixa").select("descricao, valor, data").is("deletado_em", null),
  ]);

  const vendaIds = (vendas ?? []).map((v) => v.id);
  const { data: pagamentosDasVendas } = vendaIds.length
    ? await supabase.from("venda_pagamentos").select("venda_id, forma_pagamento, valor, valor_recebido_liquido").in("venda_id", vendaIds)
    : { data: [] as { venda_id: string; forma_pagamento: string; valor: number; valor_recebido_liquido: number | null }[] };

  // Pra cada venda, o valor que efetivamente entrou no caixa: pagamentos em
  // dinheiro/PIX contam pelo valor cheio, cartão conta pelo valor líquido
  // (desconta a taxa da maquininha) quando essa informação foi registrada —
  // mesmo critério usado pros pagamentos de OS logo abaixo.
  const valorLiquidoPorVenda = new Map<string, number>();
  for (const p of pagamentosDasVendas ?? []) {
    const valor = p.forma_pagamento === "cartao" && p.valor_recebido_liquido != null ? p.valor_recebido_liquido : p.valor;
    valorLiquidoPorVenda.set(p.venda_id, (valorLiquidoPorVenda.get(p.venda_id) ?? 0) + valor);
  }

  function valorPagamentoOs(p: { forma_pagamento: string; valor: number; valor_recebido_liquido: number | null }) {
    return p.forma_pagamento === "cartao" && p.valor_recebido_liquido != null ? p.valor_recebido_liquido : p.valor;
  }

  const entradasOs: MovimentoDatado[] = (pagamentosOs ?? []).map((p) => ({
    data: p.data,
    valor: valorPagamentoOs(p),
    descricao: "",
  }));
  const entradasPdv: MovimentoDatado[] = (vendas ?? []).map((v) => ({
    data: dataBR(v.created_at),
    valor: valorLiquidoPorVenda.get(v.id) ?? v.total,
    descricao: "",
  }));
  const entradas = [...entradasOs, ...entradasPdv];

  const saidasDespesas: MovimentoDatado[] = (despesas ?? []).map((d) => ({
    data: d.data,
    valor: d.valor,
    descricao: d.categoria ? `${d.descricao} (${d.categoria})` : d.descricao,
  }));
  const saidasContas: MovimentoDatado[] = (contas ?? [])
    .filter((c) => c.status === "pago" && c.pago_em)
    .map((c) => ({
      data: c.pago_em as string,
      valor: c.valor,
      descricao: c.fornecedor ? `${c.descricao} — ${c.fornecedor}` : c.descricao,
    }));
  const saidasFretes: MovimentoDatado[] = (fretes ?? [])
    .filter((f) => f.status === "pago" && f.data_pagamento)
    .map((f) => ({
      data: f.data_pagamento as string,
      valor: f.valor_custo,
      descricao: [
        f.ordens_servico ? `OS #OS-${String(f.ordens_servico.numero).padStart(4, "0")}` : null,
        f.prestadores_frete?.nome ?? null,
      ]
        .filter(Boolean)
        .join(" — ") || "Frete",
    }));
  const saidasRetiradas: MovimentoDatado[] = (retiradas ?? []).map((r) => ({
    data: r.data,
    valor: r.valor,
    descricao: `${r.descricao} (${retiradaTipoMap[r.tipo]?.label ?? r.tipo})`,
  }));
  const ajustesMovimento: MovimentoDatado[] = (ajustes ?? []).map((a) => ({ data: a.data, valor: a.valor, descricao: a.descricao }));

  const somaAntes = (lista: MovimentoDatado[]) => lista.filter((m) => m.data < inicioMes).reduce((acc, m) => acc + m.valor, 0);
  const noMes = (lista: MovimentoDatado[]) =>
    lista.filter((m) => m.data >= inicioMes && m.data <= fimMes).sort((a, b) => (a.data < b.data ? -1 : 1));
  const somaNoMes = (lista: MovimentoDatado[]) => noMes(lista).reduce((acc, m) => acc + m.valor, 0);

  const entradasAntes = somaAntes(entradas);
  const saidasAntes =
    somaAntes(saidasDespesas) + somaAntes(saidasContas) + somaAntes(saidasFretes) + somaAntes(saidasRetiradas);
  const ajustesAntes = somaAntes(ajustesMovimento);
  const saldoInicial = entradasAntes - saidasAntes + ajustesAntes;

  const entradasMes = somaNoMes(entradas);
  const despesasMes = somaNoMes(saidasDespesas);
  const contasPagasMes = somaNoMes(saidasContas);
  const fretesPagosMes = somaNoMes(saidasFretes);
  const retiradasMes = somaNoMes(saidasRetiradas);
  const ajustesMes = somaNoMes(ajustesMovimento);
  const saidasMes = despesasMes + contasPagasMes + fretesPagosMes + retiradasMes;
  const saldoFinal = saldoInicial + entradasMes - saidasMes + ajustesMes;

  const formasNoMes = ["pix", "cartao", "dinheiro"].map((forma) => {
    const pagamentosDoMes = (pagamentosOs ?? []).filter((p) => p.forma_pagamento === forma && p.data >= inicioMes && p.data <= fimMes);
    const pdvDoMes = (vendas ?? []).filter((v) => v.forma_pagamento === forma && dataBR(v.created_at) >= inicioMes && dataBR(v.created_at) <= fimMes);
    const totalOs = pagamentosDoMes.reduce((acc, p) => acc + valorPagamentoOs(p), 0);
    const totalPdv = pdvDoMes.reduce((acc, v) => acc + (valorLiquidoPorVenda.get(v.id) ?? v.total), 0);
    return { forma, label: formaPagamentoLabel[forma] ?? forma, valor: totalOs + totalPdv };
  }).filter((f) => f.valor > 0);

  const buffer = await renderToBuffer(
    FechamentoPdf({
      config,
      mes,
      saldoInicial,
      entradasMes,
      despesasMes,
      contasPagasMes,
      fretesPagosMes,
      retiradasMes,
      ajustesMes,
      saldoFinal,
      formasNoMes,
      detalheDespesas: noMes(saidasDespesas),
      detalheContas: noMes(saidasContas),
      detalheFretes: noMes(saidasFretes),
      detalheRetiradas: noMes(saidasRetiradas),
      detalheAjustes: noMes(ajustesMovimento),
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="fechamento-${mes}.pdf"`,
    },
  });
}
