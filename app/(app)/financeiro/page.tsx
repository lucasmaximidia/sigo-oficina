import Link from "next/link";
import {
  AlertTriangle,
  ClipboardList,
  Truck,
  FileBarChart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  BarChart3,
  Wallet2,
  PiggyBank,
  Wrench,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LancarDespesaDialog } from "@/components/financeiro/lancar-despesa-dialog";
import { AcertoParceiros } from "@/components/financeiro/acerto-parceiros";
import { EntradasTab } from "@/components/financeiro/entradas-tab";
import { ContasTab } from "@/components/financeiro/contas-tab";
import { DespesasTab } from "@/components/financeiro/despesas-tab";
import { RetiradasTab } from "@/components/financeiro/retiradas-tab";
import { AjustesCaixaTab } from "@/components/financeiro/ajustes-caixa-tab";
import { FretesTab } from "@/components/financeiro/fretes-tab";
import { FaturamentoChart } from "@/components/financeiro/faturamento-chart";
import { FormasPagamentoCard } from "@/components/financeiro/formas-pagamento-card";
import { agoraBR, cn, dataBR, diasAPartirDe, formatCurrency, formatDate, hojeBR } from "@/lib/utils";
import { formaPagamentoLabel } from "@/lib/relatorio-financeiro";
import { AcertoAutorizadas } from "@/components/financeiro/acerto-autorizadas";
import type { ParceiroPendente, AutorizadaPendente, Entrada, FreteComRelacoes } from "@/types";

interface OsEntradaRow {
  id: string;
  numero: number;
  data_pagamento: string | null;
  data_finalizacao: string | null;
  forma_pagamento: string | null;
  valor_mao_obra: number;
  valor_frete: number;
  desconto: number;
  valor_recebido_liquido: number | null;
  clientes: { nome: string } | null;
}

// Versão enxuta de OsEntradaRow/VendaEntradaRow — sem join de cliente, só o
// necessário pra somar valores. Usada pros totais (saldo em caixa, gráfico
// de 6 meses, mês anterior etc.), que precisam do histórico inteiro, nunca
// só do período escolhido na tela — diferente da lista de "Entradas", que
// é só o que aparece na tela e pode ficar limitada ao período.
interface OsStatsRow {
  id: string;
  data_pagamento: string | null;
  data_finalizacao: string | null;
  forma_pagamento: string | null;
  valor_mao_obra: number;
  valor_frete: number;
  desconto: number;
  valor_recebido_liquido: number | null;
}

interface VendaEntradaRow {
  id: string;
  numero: number;
  created_at: string;
  forma_pagamento: string;
  total: number;
  cliente_nome_avulso: string | null;
  clientes: { nome: string } | null;
}

interface VendaStatsRow {
  id: string;
  created_at: string;
  forma_pagamento: string;
  total: number;
}

interface FreteStatsRow {
  id: string;
  status: string;
  data_pagamento: string | null;
  valor_custo: number;
  ordens_servico: {
    valor_frete: number;
    data_pagamento: string | null;
    data_finalizacao: string | null;
    forma_pagamento: string | null;
  } | null;
}

interface ItemParceiroPendenteRow {
  id: string;
  loja_parceira_id: string | null;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  ordens_servico: { numero: number; forma_pagamento: string | null } | null;
  lojas_parceiras: { nome: string } | null;
}

interface OsAutorizadaPendenteRow {
  id: string;
  numero: number;
  valor_mao_obra: number;
  valor_frete: number;
  desconto: number;
  data_finalizacao: string | null;
  empresa_autorizada_id: string | null;
  empresas_autorizadas: { nome: string } | null;
  os_itens: { quantidade: number; valor_unitario: number }[];
  os_pagamentos: { valor: number }[];
}

export const dynamic = "force-dynamic";

// Limita quanto histórico as listas da tela carregam de uma vez (contas já
// pagas, despesas, entradas, retiradas, ajustes) — sem isso, cada visita
// carregava a tabela inteira desde o início do sistema, ficando mais lenta
// conforme o histórico cresce. Contas em aberto e fretes pendentes sempre
// aparecem, não importa a antiguidade; só o que já foi resolvido é afetado.
// Os totais que dependem do histórico completo (saldo em caixa, gráfico de
// 6 meses) usam consultas enxutas separadas, nunca limitadas pelo período.
const PERIODOS = [
  { value: "1m", label: "1 mês", dias: 30 },
  { value: "3m", label: "3 meses", dias: 90 },
  { value: "6m", label: "6 meses", dias: 180 },
  { value: "12m", label: "12 meses", dias: 365 },
  { value: "tudo", label: "Tudo", dias: null },
] as const;

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const supabase = await createClient();
  const hojeStr = hojeBR();
  const em7diasStr = diasAPartirDe(hojeStr, 7);
  const { periodo } = await searchParams;
  const periodoAtivo = PERIODOS.find((p) => p.value === periodo)?.value ?? "3m";
  const dias = PERIODOS.find((p) => p.value === periodoAtivo)!.dias;
  const desdeStr = dias != null ? diasAPartirDe(hojeStr, -dias) : null;

  let contasQuery = supabase.from("financeiro_contas").select("*").is("deletado_em", null).order("vencimento", { ascending: true });
  if (desdeStr) contasQuery = contasQuery.or(`status.neq.pago,vencimento.gte.${desdeStr}`);

  let despesasQuery = supabase.from("financeiro_despesas").select("*").is("deletado_em", null).order("data", { ascending: false });
  if (desdeStr) despesasQuery = despesasQuery.gte("data", desdeStr);

  let fretesQuery = supabase
    .from("fretes")
    .select<string, FreteComRelacoes>(
      "id, os_id, valor_custo, status, tipo, data_pagamento, created_at, ordens_servico(numero, valor_frete, data_pagamento, data_finalizacao, forma_pagamento), prestadores_frete(nome)"
    )
    .order("created_at", { ascending: false });
  if (desdeStr) fretesQuery = fretesQuery.or(`status.eq.pendente,data_pagamento.gte.${desdeStr}`);

  let osPagasQuery = supabase
    .from("ordens_servico")
    .select<string, OsEntradaRow>(
      "id, numero, data_pagamento, data_finalizacao, forma_pagamento, valor_mao_obra, valor_frete, desconto, valor_recebido_liquido, clientes(nome)"
    )
    .not("forma_pagamento", "is", null)
    .order("data_pagamento", { ascending: false });
  if (desdeStr) osPagasQuery = osPagasQuery.gte("data_finalizacao", desdeStr);

  let vendasQuery = supabase
    .from("vendas_pdv")
    .select<string, VendaEntradaRow>("id, numero, created_at, forma_pagamento, total, cliente_nome_avulso, clientes(nome)")
    .is("deletado_em", null)
    .order("created_at", { ascending: false });
  if (desdeStr) vendasQuery = vendasQuery.gte("created_at", desdeStr);

  let retiradasQuery = supabase.from("financeiro_retiradas").select("*").is("deletado_em", null).order("data", { ascending: false });
  if (desdeStr) retiradasQuery = retiradasQuery.gte("data", desdeStr);

  let ajustesCaixaQuery = supabase.from("financeiro_ajustes_caixa").select("*").is("deletado_em", null).order("data", { ascending: false });
  if (desdeStr) ajustesCaixaQuery = ajustesCaixaQuery.gte("data", desdeStr);

  const [
    { data: contas },
    { data: despesas },
    { data: fretes },
    { data: osPagas },
    { data: vendas },
    { data: retiradas },
    { data: itensParceiroPendentes },
    { data: osAutorizadaPendentes },
    { data: ajustesCaixa },
    { data: despesasTotalRows },
    { data: osPagasStats },
    { data: vendasStats },
    { data: fretesStats },
    { data: contasPagasTotalRows },
    { data: retiradasTotalRows },
    { data: ajustesTotalRows },
  ] = await Promise.all([
    contasQuery,
    despesasQuery,
    fretesQuery,
    osPagasQuery,
    vendasQuery,
    retiradasQuery,
    supabase
      .from("os_itens")
      .select<string, ItemParceiroPendenteRow>(
        "id, loja_parceira_id, descricao, quantidade, valor_unitario, ordens_servico(numero, forma_pagamento), lojas_parceiras(nome)"
      )
      .eq("origem", "loja_parceira")
      .is("pago_em", null),
    supabase
      .from("ordens_servico")
      .select<string, OsAutorizadaPendenteRow>(
        "id, numero, valor_mao_obra, valor_frete, desconto, data_finalizacao, empresa_autorizada_id, empresas_autorizadas(nome), os_itens(quantidade, valor_unitario), os_pagamentos(valor)"
      )
      .eq("status", "finalizado")
      .is("forma_pagamento", null)
      .not("empresa_autorizada_id", "is", null),
    ajustesCaixaQuery,
    supabase.from("financeiro_despesas").select("valor").is("deletado_em", null),
    supabase
      .from("ordens_servico")
      .select<string, OsStatsRow>(
        "id, data_pagamento, data_finalizacao, forma_pagamento, valor_mao_obra, valor_frete, desconto, valor_recebido_liquido"
      )
      .not("forma_pagamento", "is", null),
    supabase.from("vendas_pdv").select<string, VendaStatsRow>("id, created_at, forma_pagamento, total").is("deletado_em", null),
    supabase
      .from("fretes")
      .select<string, FreteStatsRow>(
        "id, status, data_pagamento, valor_custo, ordens_servico(valor_frete, data_pagamento, data_finalizacao, forma_pagamento)"
      ),
    supabase.from("financeiro_contas").select("valor").is("deletado_em", null).eq("status", "pago"),
    supabase.from("financeiro_retiradas").select("valor").is("deletado_em", null),
    supabase.from("financeiro_ajustes_caixa").select("valor").is("deletado_em", null),
  ]);

  // Itens/pagamentos pro cálculo do valor de cada OS/venda — a partir do
  // histórico COMPLETO (osPagasStats/vendasStats), não só do que aparece na
  // tela, já que o saldo em caixa precisa do total real desde sempre. Os ids
  // da lista exibida (osPagas/vendas) sempre são um subconjunto desses.
  const osIdsStats = (osPagasStats ?? []).map((os) => os.id);
  const vendaIdsStats = (vendasStats ?? []).map((v) => v.id);
  const [{ data: itensDasOsPagas }, { data: pagamentosDasVendas }] = await Promise.all([
    osIdsStats.length
      ? supabase.from("os_itens").select("os_id, quantidade, valor_unitario").in("os_id", osIdsStats)
      : Promise.resolve({ data: [] as { os_id: string; quantidade: number; valor_unitario: number }[] }),
    vendaIdsStats.length
      ? supabase
          .from("venda_pagamentos")
          .select("venda_id, forma_pagamento, valor, valor_recebido_liquido")
          .in("venda_id", vendaIdsStats)
      : Promise.resolve({
          data: [] as { venda_id: string; forma_pagamento: string; valor: number; valor_recebido_liquido: number | null }[],
        }),
  ]);

  // Pra cada venda, o valor que efetivamente entrou no caixa: pagamentos em
  // dinheiro/PIX contam pelo valor cheio, cartão conta pelo valor líquido
  // (desconta a taxa da maquininha) quando essa informação foi registrada —
  // mesmo critério já usado pras OS logo abaixo.
  const valorLiquidoPorVenda = new Map<string, number>();
  for (const p of pagamentosDasVendas ?? []) {
    const valor = p.forma_pagamento === "cartao" && p.valor_recebido_liquido != null ? p.valor_recebido_liquido : p.valor;
    valorLiquidoPorVenda.set(p.venda_id, (valorLiquidoPorVenda.get(p.venda_id) ?? 0) + valor);
  }

  const totalItensPorOs = new Map<string, number>();
  for (const item of itensDasOsPagas ?? []) {
    totalItensPorOs.set(item.os_id, (totalItensPorOs.get(item.os_id) ?? 0) + item.quantidade * item.valor_unitario);
  }

  function valorOs(os: { id: string; forma_pagamento: string | null; valor_mao_obra: number; valor_frete: number; desconto: number; valor_recebido_liquido: number | null }) {
    const totalItens = totalItensPorOs.get(os.id) ?? 0;
    const totalCalculado = totalItens + os.valor_mao_obra + os.valor_frete - os.desconto;
    return os.forma_pagamento === "cartao" && os.valor_recebido_liquido != null ? os.valor_recebido_liquido : totalCalculado;
  }

  // Lista exibida na aba "Entradas" — só o período escolhido.
  const entradasOs: Entrada[] = (osPagas ?? []).map((os) => ({
    id: os.id,
    tipo: "os",
    origemLabel: `OS #OS-${String(os.numero).padStart(4, "0")}`,
    cliente: os.clientes?.nome ?? "—",
    data: os.data_pagamento ?? (os.data_finalizacao ? dataBR(os.data_finalizacao) : ""),
    formaPagamento: os.forma_pagamento ? (formaPagamentoLabel[os.forma_pagamento] ?? os.forma_pagamento) : "—",
    formaPagamentoChave: os.forma_pagamento ?? "outro",
    valor: valorOs(os),
  }));

  const entradasPdv: Entrada[] = (vendas ?? []).map((venda) => ({
    id: venda.id,
    tipo: "pdv",
    origemLabel: `Venda #${String(venda.numero).padStart(4, "0")}`,
    cliente: venda.clientes?.nome ?? venda.cliente_nome_avulso ?? "Cliente avulso",
    data: dataBR(venda.created_at),
    formaPagamento: formaPagamentoLabel[venda.forma_pagamento] ?? venda.forma_pagamento,
    formaPagamentoChave: venda.forma_pagamento,
    valor: valorLiquidoPorVenda.get(venda.id) ?? venda.total,
  }));

  const entradas = [...entradasOs, ...entradasPdv].sort((a, b) => (a.data < b.data ? 1 : -1));

  // Entradas "de verdade" (histórico completo) — usadas só pros totais
  // (saldo em caixa, gráfico, mês anterior etc.), nunca pra lista exibida.
  const entradasOsStats = (osPagasStats ?? []).map((os) => ({
    data: os.data_pagamento ?? (os.data_finalizacao ? dataBR(os.data_finalizacao) : ""),
    formaPagamentoChave: os.forma_pagamento ?? "outro",
    valor: valorOs(os),
  }));
  const entradasPdvStats = (vendasStats ?? []).map((venda) => ({
    data: dataBR(venda.created_at),
    formaPagamentoChave: venda.forma_pagamento,
    valor: valorLiquidoPorVenda.get(venda.id) ?? venda.total,
  }));
  const entradasStats = [...entradasOsStats, ...entradasPdvStats];

  const totalRecebidoNoMes = entradasStats.filter((e) => e.data.startsWith(hojeStr.slice(0, 7))).reduce((acc, e) => acc + e.valor, 0);

  const entradasMesAtual = entradasStats.filter((e) => e.data.startsWith(hojeStr.slice(0, 7)));
  const { ano: anoAtual, mes: mesAtualNum } = agoraBR();
  const mesAtualData = new Date(anoAtual, mesAtualNum - 1, 1);
  const mesAnteriorData = new Date(anoAtual, mesAtualNum - 1 - 1, 1);
  const mesAnteriorStr = `${mesAnteriorData.getFullYear()}-${String(mesAnteriorData.getMonth() + 1).padStart(2, "0")}`;
  const totalMesAnterior = entradasStats.filter((e) => e.data.startsWith(mesAnteriorStr)).reduce((acc, e) => acc + e.valor, 0);
  const ticketMedio = entradasMesAtual.length > 0 ? totalRecebidoNoMes / entradasMesAtual.length : 0;
  const variacaoMes = totalMesAnterior > 0 ? ((totalRecebidoNoMes - totalMesAnterior) / totalMesAnterior) * 100 : null;

  const totalMaoObraNoMes = (osPagasStats ?? [])
    .filter((os) => {
      const data = os.data_pagamento ?? (os.data_finalizacao ? dataBR(os.data_finalizacao) : "");
      return data.startsWith(hojeStr.slice(0, 7));
    })
    .reduce((acc, os) => acc + os.valor_mao_obra, 0);

  const mesesGrafico = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(anoAtual, mesAtualNum - 1 - (5 - i), 1);
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(d).replace(".", "");
    const valor = entradasStats.filter((e) => e.data.startsWith(chave)).reduce((acc, e) => acc + e.valor, 0);
    return { label: label.charAt(0).toUpperCase() + label.slice(1), valor };
  });

  const formasPagamentoMes = ["pix", "cartao", "dinheiro"]
    .map((forma) => ({
      forma,
      valor: entradasMesAtual.filter((e) => e.formaPagamentoChave === forma).reduce((acc, e) => acc + e.valor, 0),
    }))
    .filter((f) => f.valor > 0);

  // Fretes: pendentes, mês pago e lucro do mês sempre a partir do histórico
  // completo (fretesStats) — a lista exibida (fretes) pode estar limitada
  // ao período, mas esses números não podem depender disso.
  const fretesPendentes = (fretesStats ?? []).filter((f) => f.status === "pendente");
  const totalFretePendente = fretesPendentes.reduce((acc, f) => acc + f.valor_custo, 0);
  const mesAtual = hojeStr.slice(0, 7);
  const totalFretePagoNoMes = (fretesStats ?? [])
    .filter((f) => f.status === "pago" && f.data_pagamento?.startsWith(mesAtual))
    .reduce((acc, f) => acc + f.valor_custo, 0);
  // O mês do lucro segue o mês em que o cliente pagou a OS (mesmo critério
  // de "Faturamento do mês"/"Mão de Obra do mês"), não a data em que o
  // frete foi pago ao prestador — o freteiro pode ter sido pago antes de a
  // OS ser finalizada/paga pelo cliente, e o lucro só existe quando as duas
  // pontas (cobrado e pago) já são conhecidas.
  const lucroFreteNoMes = (fretesStats ?? [])
    .filter((f) => {
      const os = f.ordens_servico;
      if (!os || !os.forma_pagamento) return false;
      const data = os.data_pagamento ?? (os.data_finalizacao ? dataBR(os.data_finalizacao) : "");
      return data.startsWith(mesAtual);
    })
    .reduce((acc, f) => acc + (f.ordens_servico?.valor_frete ?? 0) - f.valor_custo, 0);

  const vencendoHojeOuAtrasado = (contas ?? []).filter((c) => c.status !== "pago" && c.vencimento <= hojeStr);
  const proximos7dias = (contas ?? []).filter((c) => c.status !== "pago" && c.vencimento > hojeStr && c.vencimento <= em7diasStr);

  const totalVencendo = vencendoHojeOuAtrasado.reduce((acc, c) => acc + c.valor, 0);
  const totalProximos = proximos7dias.reduce((acc, c) => acc + c.valor, 0);

  // Saldo em caixa: soma de tudo que já entrou (desde o início) menos tudo
  // que já saiu (despesas, contas pagas, fretes pagos e retiradas), mais os
  // ajustes manuais (ex: saldo em caixa anterior ao sistema) — sempre a
  // partir do histórico completo (consultas enxutas acima, "...TotalRows"/
  // "...Stats"), nunca do período escolhido na tela.
  const totalEntradasGeral = entradasStats.reduce((acc, e) => acc + e.valor, 0);
  const totalDespesasGeral = (despesasTotalRows ?? []).reduce((acc, d) => acc + d.valor, 0);
  const totalContasPagasGeral = (contasPagasTotalRows ?? []).reduce((acc, c) => acc + c.valor, 0);
  const totalFretesPagosGeral = (fretesStats ?? []).filter((f) => f.status === "pago").reduce((acc, f) => acc + f.valor_custo, 0);
  const totalRetiradasGeral = (retiradasTotalRows ?? []).reduce((acc, r) => acc + r.valor, 0);
  const totalSaidasGeral = totalDespesasGeral + totalContasPagasGeral + totalFretesPagosGeral + totalRetiradasGeral;
  const totalAjustesGeral = (ajustesTotalRows ?? []).reduce((acc, a) => acc + a.valor, 0);
  const saldoCaixa = totalEntradasGeral - totalSaidasGeral + totalAjustesGeral;

  // O acerto só pode ser fechado com itens de OS que o cliente já pagou,
  // mas a lista mostra todos os itens pendentes com o parceiro (o toggle
  // decide o que aparece) — daí o total geral e o total fechável.
  const parceirosPendentes = Array.from(
    (itensParceiroPendentes ?? []).reduce((acc, item) => {
      if (!item.loja_parceira_id) return acc;
      const atual = acc.get(item.loja_parceira_id) ?? {
        lojaId: item.loja_parceira_id,
        lojaNome: item.lojas_parceiras?.nome ?? "Loja parceira",
        totalFechavel: 0,
        totalGeral: 0,
        itens: [],
      };
      const valorItem = item.quantidade * item.valor_unitario;
      const clientePagou = item.ordens_servico?.forma_pagamento != null;
      atual.totalGeral += valorItem;
      if (clientePagou) atual.totalFechavel += valorItem;
      atual.itens.push({
        id: item.id,
        descricao: item.descricao,
        valor: valorItem,
        osNumero: item.ordens_servico?.numero ?? null,
        clientePagou,
      });
      acc.set(item.loja_parceira_id, atual);
      return acc;
    }, new Map<string, ParceiroPendente>()).values()
  );

  const autorizadasPendentes = Array.from(
    (osAutorizadaPendentes ?? []).reduce((acc, os) => {
      if (!os.empresa_autorizada_id) return acc;
      const totalItens = os.os_itens.reduce((a, i) => a + i.quantidade * i.valor_unitario, 0);
      const totalPago = os.os_pagamentos.reduce((a, p) => a + p.valor, 0);
      const valor = totalItens + os.valor_mao_obra + os.valor_frete - os.desconto - totalPago;
      if (valor <= 0.001) return acc;

      const atual = acc.get(os.empresa_autorizada_id) ?? {
        empresaId: os.empresa_autorizada_id,
        empresaNome: os.empresas_autorizadas?.nome ?? "Autorizada",
        total: 0,
        itens: [],
      };
      atual.total += valor;
      atual.itens.push({ osId: os.id, osNumero: os.numero, valor, dataFinalizacao: os.data_finalizacao });
      acc.set(os.empresa_autorizada_id as string, atual);
      return acc;
    }, new Map<string, AutorizadaPendente>()).values()
  );

  return (
    <div>
      <PageHeader
        title="Financeiro"
        description="Gerencie suas contas a pagar e despesas operacionais."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/financeiro/relatorio">
                <FileBarChart className="size-4" />
                Relatório
              </Link>
            </Button>
            <LancarDespesaDialog />
          </>
        }
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Período das listas:</span>
        <div className="inline-flex items-center gap-1 rounded-xl bg-muted p-1">
          {PERIODOS.map((p) => (
            <Link
              key={p.value}
              href={p.value === "3m" ? "/financeiro" : `/financeiro?periodo=${p.value}`}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
                periodoAtivo === p.value ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </Link>
          ))}
        </div>
        {desdeStr && (
          <span className="text-xs text-muted-foreground">
            mostrando itens já resolvidos desde {formatDate(desdeStr)} · em aberto sempre aparece
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-4 rounded-xl border border-border bg-gradient-to-br from-card to-accent/25 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between md:p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
            <PiggyBank className="size-5.5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Saldo em Caixa</p>
            <p className="font-display text-3xl font-bold text-foreground">{formatCurrency(saldoCaixa)}</p>
          </div>
        </div>
        <div className="flex gap-6 sm:border-l sm:border-border sm:pl-6">
          <div>
            <p className="text-xs text-muted-foreground">Entradas (total)</p>
            <p className="text-sm font-semibold text-success">{formatCurrency(totalEntradasGeral)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Saídas (total)</p>
            <p className="text-sm font-semibold text-destructive">{formatCurrency(totalSaidasGeral)}</p>
          </div>
          {totalAjustesGeral !== 0 && (
            <div>
              <p className="text-xs text-muted-foreground">Ajustes (total)</p>
              <p className={cn("text-sm font-semibold", totalAjustesGeral >= 0 ? "text-success" : "text-destructive")}>
                {totalAjustesGeral >= 0 ? "+" : ""}
                {formatCurrency(totalAjustesGeral)}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-5">
        <StatCard icon={TrendingUp} label="Recebido este mês" value={formatCurrency(totalRecebidoNoMes)} tone="success" />
        <StatCard icon={AlertTriangle} label="Vencendo Hoje/Atrasado" value={formatCurrency(totalVencendo)} tone="danger" />
        <StatCard icon={ClipboardList} label="Próximos 7 dias" value={formatCurrency(totalProximos)} />
        <StatCard icon={Wrench} label="Mão de Obra do mês" value={formatCurrency(totalMaoObraNoMes)} tone="highlight" />
        <StatCard icon={Truck} label="Lucro no Frete do mês" value={formatCurrency(lucroFreteNoMes)} tone="success" />
      </div>

      <Tabs defaultValue="visao-geral" className="mt-5">
        <TabsList>
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="entradas">Entradas</TabsTrigger>
          <TabsTrigger value="contas">Contas a Pagar (Boletos)</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="retiradas">Retiradas</TabsTrigger>
          <TabsTrigger value="ajustes">Ajustes de Caixa</TabsTrigger>
          <TabsTrigger value="fretes">Fretes</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
            <StatCard
              icon={TrendingUp}
              label="Faturamento do mês"
              value={formatCurrency(totalRecebidoNoMes)}
              hint={new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(mesAtualData)}
            />
            <StatCard
              icon={variacaoMes !== null && variacaoMes < 0 ? ArrowDownRight : ArrowUpRight}
              label="Vs. mês anterior"
              value={variacaoMes !== null ? `${variacaoMes >= 0 ? "+" : ""}${variacaoMes.toFixed(1)}%` : "—"}
              tone={variacaoMes === null ? "default" : variacaoMes >= 0 ? "success" : "danger"}
              hint={`${formatCurrency(totalMesAnterior)} no mês anterior`}
            />
            <StatCard
              icon={Receipt}
              label="Ticket médio"
              value={formatCurrency(ticketMedio)}
              hint={`${entradasMesAtual.length} ${entradasMesAtual.length === 1 ? "entrada" : "entradas"} no mês`}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="size-4.5 text-primary" />
                  Faturamento por mês
                </CardTitle>
                <p className="text-xs text-muted-foreground">Últimos 6 meses · valores em milhares de R$</p>
              </CardHeader>
              <CardContent>
                <FaturamentoChart meses={mesesGrafico} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet2 className="size-4.5 text-primary" />
                  Formas de Pagamento
                </CardTitle>
                <p className="text-xs text-muted-foreground">Este mês</p>
              </CardHeader>
              <CardContent>
                <FormasPagamentoCard dados={formasPagamentoMes} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="entradas">
          <AcertoAutorizadas autorizadas={autorizadasPendentes} />
          <EntradasTab entradas={entradas} />
        </TabsContent>

        <TabsContent value="contas">
          <ContasTab contas={contas ?? []} hojeStr={hojeStr} />
        </TabsContent>

        <TabsContent value="despesas">
          <DespesasTab despesas={despesas ?? []} />
        </TabsContent>

        <TabsContent value="retiradas" className="flex flex-col gap-4">
          <AcertoParceiros parceiros={parceirosPendentes} />
          <RetiradasTab retiradas={retiradas ?? []} />
        </TabsContent>

        <TabsContent value="ajustes">
          <AjustesCaixaTab ajustes={ajustesCaixa ?? []} />
        </TabsContent>

        <TabsContent value="fretes">
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatCard icon={AlertTriangle} label="Pendente de pagamento" value={formatCurrency(totalFretePendente)} tone="danger" />
            <StatCard icon={Truck} label="Pago este mês" value={formatCurrency(totalFretePagoNoMes)} />
          </div>
          <FretesTab fretes={fretes ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
