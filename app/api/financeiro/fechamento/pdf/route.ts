import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { FechamentoPdf } from "@/components/financeiro/fechamento-pdf";
import { formaPagamentoLabel } from "@/lib/relatorio-financeiro";
import { retiradaTipoMap } from "@/lib/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface OsPagaRow {
  id: string;
  data_pagamento: string | null;
  data_finalizacao: string | null;
  forma_pagamento: string | null;
  valor_mao_obra: number;
  valor_frete: number;
  desconto: number;
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
    { data: osPagas },
    { data: vendas },
    { data: despesas },
    { data: contas },
    { data: fretes },
    { data: retiradas },
    { data: ajustes },
  ] = await Promise.all([
    supabase
      .from("ordens_servico")
      .select<string, OsPagaRow>(
        "id, data_pagamento, data_finalizacao, forma_pagamento, valor_mao_obra, valor_frete, desconto, valor_recebido_liquido"
      )
      .not("forma_pagamento", "is", null),
    supabase.from("vendas_pdv").select("id, created_at, total, forma_pagamento").is("deletado_em", null),
    supabase.from("financeiro_despesas").select("descricao, categoria, valor, data").is("deletado_em", null),
    supabase.from("financeiro_contas").select("descricao, fornecedor, valor, pago_em, status").is("deletado_em", null),
    supabase
      .from("fretes")
      .select<string, FreteRow>("valor_custo, status, data_pagamento, ordens_servico(numero), prestadores_frete(nome)"),
    supabase.from("financeiro_retiradas").select("descricao, tipo, valor, data").is("deletado_em", null),
    supabase.from("financeiro_ajustes_caixa").select("descricao, valor, data").is("deletado_em", null),
  ]);

  const osIds = (osPagas ?? []).map((os) => os.id);
  const { data: itensDasOs } = osIds.length
    ? await supabase.from("os_itens").select("os_id, quantidade, valor_unitario").in("os_id", osIds)
    : { data: [] as { os_id: string; quantidade: number; valor_unitario: number }[] };

  const totalItensPorOs = new Map<string, number>();
  for (const item of itensDasOs ?? []) {
    totalItensPorOs.set(item.os_id, (totalItensPorOs.get(item.os_id) ?? 0) + item.quantidade * item.valor_unitario);
  }

  const entradasOs: MovimentoDatado[] = (osPagas ?? []).map((os) => {
    const totalItens = totalItensPorOs.get(os.id) ?? 0;
    const totalCalculado = totalItens + os.valor_mao_obra + os.valor_frete - os.desconto;
    const valor = os.forma_pagamento === "cartao" && os.valor_recebido_liquido != null ? os.valor_recebido_liquido : totalCalculado;
    return { data: os.data_pagamento ?? (os.data_finalizacao ? os.data_finalizacao.slice(0, 10) : ""), valor, descricao: "" };
  });
  const entradasPdv: MovimentoDatado[] = (vendas ?? []).map((v) => ({ data: v.created_at.slice(0, 10), valor: v.total, descricao: "" }));
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
    const osDoMes = (osPagas ?? []).filter((os) => {
      const data = os.data_pagamento ?? (os.data_finalizacao ? os.data_finalizacao.slice(0, 10) : "");
      return os.forma_pagamento === forma && data >= inicioMes && data <= fimMes;
    });
    const pdvDoMes = (vendas ?? []).filter((v) => v.forma_pagamento === forma && v.created_at.slice(0, 10) >= inicioMes && v.created_at.slice(0, 10) <= fimMes);
    const totalOs = osDoMes.reduce((acc, os) => {
      const totalItens = totalItensPorOs.get(os.id) ?? 0;
      const totalCalculado = totalItens + os.valor_mao_obra + os.valor_frete - os.desconto;
      return acc + (os.forma_pagamento === "cartao" && os.valor_recebido_liquido != null ? os.valor_recebido_liquido : totalCalculado);
    }, 0);
    const totalPdv = pdvDoMes.reduce((acc, v) => acc + v.total, 0);
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
