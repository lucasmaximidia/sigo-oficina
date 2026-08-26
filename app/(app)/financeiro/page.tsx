import Link from "next/link";
import {
  AlertTriangle,
  ClipboardList,
  Truck,
  FileBarChart,
  TrendingUp,
  Wrench,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  BarChart3,
  Wallet2,
  PiggyBank,
  Store,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LancarDespesaDialog } from "@/components/financeiro/lancar-despesa-dialog";
import { LancarRetiradaDialog } from "@/components/financeiro/lancar-retirada-dialog";
import { FecharContaParceiroButton } from "@/components/financeiro/fechar-conta-parceiro-button";
import { NovaContaDialog } from "@/components/financeiro/nova-conta-dialog";
import { MarcarPagoButton } from "@/components/financeiro/marcar-pago-button";
import { MarcarFretePagoButton } from "@/components/financeiro/marcar-frete-pago-button";
import {
  ExcluirContaButton,
  ExcluirDespesaButton,
  ExcluirEntradaButton,
  ExcluirRetiradaButton,
} from "@/components/financeiro/excluir-lancamento-buttons";
import { ExportarCsvButton } from "@/components/ui/exportar-csv-button";
import { FaturamentoChart } from "@/components/financeiro/faturamento-chart";
import { FormasPagamentoCard } from "@/components/financeiro/formas-pagamento-card";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { contaStatusMap, freteStatusMap, retiradaTipoMap } from "@/lib/status";
import { formaPagamentoLabel } from "@/lib/relatorio-financeiro";
import type { ContaStatus, RetiradaTipo } from "@/types";

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

interface VendaEntradaRow {
  id: string;
  numero: number;
  created_at: string;
  forma_pagamento: string;
  total: number;
  cliente_nome_avulso: string | null;
  clientes: { nome: string } | null;
}

interface Entrada {
  id: string;
  tipo: "os" | "pdv";
  origemLabel: string;
  origemHref?: string;
  cliente: string;
  data: string;
  formaPagamento: string;
  formaPagamentoChave: string;
  valor: number;
}

interface FreteRow {
  id: string;
  os_id: string;
  valor_custo: number;
  status: "pendente" | "pago";
  data_pagamento: string | null;
  created_at: string;
  ordens_servico: { numero: number; valor_frete: number } | null;
  prestadores_frete: { nome: string } | null;
}

interface ItemParceiroPendenteRow {
  id: string;
  loja_parceira_id: string | null;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  ordens_servico: { numero: number } | null;
  lojas_parceiras: { nome: string } | null;
}

interface ParceiroPendente {
  lojaId: string;
  lojaNome: string;
  total: number;
  itens: { id: string; descricao: string; valor: number; osNumero: number | null }[];
}

export const dynamic = "force-dynamic";

export default async function FinanceiroPage() {
  const hoje = new Date();
  const hojeStr = hoje.toISOString().slice(0, 10);
  const em7dias = new Date(hoje);
  em7dias.setDate(em7dias.getDate() + 7);

  const [{ data: contas }, { data: despesas }, { data: fretes }, { data: osPagas }, { data: vendas }, { data: retiradas }, { data: itensParceiroPendentes }] =
    await Promise.all([
      supabase.from("financeiro_contas").select("*").is("deletado_em", null).order("vencimento", { ascending: true }),
      supabase.from("financeiro_despesas").select("*").is("deletado_em", null).order("data", { ascending: false }),
      supabase
        .from("fretes")
        .select<string, FreteRow>(
          "id, os_id, valor_custo, status, data_pagamento, created_at, ordens_servico(numero, valor_frete), prestadores_frete(nome)"
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("ordens_servico")
        .select<string, OsEntradaRow>(
          "id, numero, data_pagamento, data_finalizacao, forma_pagamento, valor_mao_obra, valor_frete, desconto, valor_recebido_liquido, clientes(nome)"
        )
        .not("forma_pagamento", "is", null)
        .order("data_pagamento", { ascending: false }),
      supabase
        .from("vendas_pdv")
        .select<string, VendaEntradaRow>("id, numero, created_at, forma_pagamento, total, cliente_nome_avulso, clientes(nome)")
        .is("deletado_em", null)
        .order("created_at", { ascending: false }),
      supabase.from("financeiro_retiradas").select("*").is("deletado_em", null).order("data", { ascending: false }),
      supabase
        .from("os_itens")
        .select<string, ItemParceiroPendenteRow>(
          "id, loja_parceira_id, descricao, quantidade, valor_unitario, ordens_servico(numero), lojas_parceiras(nome)"
        )
        .eq("origem", "loja_parceira")
        .is("pago_em", null),
    ]);

  const osIdsPagas = (osPagas ?? []).map((os) => os.id);
  const { data: itensDasOsPagas } = osIdsPagas.length
    ? await supabase.from("os_itens").select("os_id, quantidade, valor_unitario").in("os_id", osIdsPagas)
    : { data: [] as { os_id: string; quantidade: number; valor_unitario: number }[] };

  const totalItensPorOs = new Map<string, number>();
  for (const item of itensDasOsPagas ?? []) {
    totalItensPorOs.set(item.os_id, (totalItensPorOs.get(item.os_id) ?? 0) + item.quantidade * item.valor_unitario);
  }

  const entradasOs: Entrada[] = (osPagas ?? []).map((os) => {
    const totalItens = totalItensPorOs.get(os.id) ?? 0;
    const totalCalculado = totalItens + os.valor_mao_obra + os.valor_frete - os.desconto;
    const valor = os.forma_pagamento === "cartao" && os.valor_recebido_liquido != null ? os.valor_recebido_liquido : totalCalculado;
    return {
      id: os.id,
      tipo: "os",
      origemLabel: `OS #OS-${String(os.numero).padStart(4, "0")}`,
      origemHref: `/ordens-servico/${os.id}`,
      cliente: os.clientes?.nome ?? "—",
      data: os.data_pagamento ?? (os.data_finalizacao ? os.data_finalizacao.slice(0, 10) : ""),
      formaPagamento: os.forma_pagamento ? (formaPagamentoLabel[os.forma_pagamento] ?? os.forma_pagamento) : "—",
      formaPagamentoChave: os.forma_pagamento ?? "outro",
      valor,
    };
  });

  const entradasPdv: Entrada[] = (vendas ?? []).map((venda) => ({
    id: venda.id,
    tipo: "pdv",
    origemLabel: `Venda #${String(venda.numero).padStart(4, "0")}`,
    cliente: venda.clientes?.nome ?? venda.cliente_nome_avulso ?? "Cliente avulso",
    data: venda.created_at.slice(0, 10),
    formaPagamento: formaPagamentoLabel[venda.forma_pagamento] ?? venda.forma_pagamento,
    formaPagamentoChave: venda.forma_pagamento,
    valor: venda.total,
  }));

  const entradas = [...entradasOs, ...entradasPdv].sort((a, b) => (a.data < b.data ? 1 : -1));
  const totalRecebidoNoMes = entradas
    .filter((e) => e.data.startsWith(hojeStr.slice(0, 7)))
    .reduce((acc, e) => acc + e.valor, 0);

  const entradasMesAtual = entradas.filter((e) => e.data.startsWith(hojeStr.slice(0, 7)));
  const mesAnteriorData = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
  const mesAnteriorStr = mesAnteriorData.toISOString().slice(0, 7);
  const totalMesAnterior = entradas
    .filter((e) => e.data.startsWith(mesAnteriorStr))
    .reduce((acc, e) => acc + e.valor, 0);
  const ticketMedio = entradasMesAtual.length > 0 ? totalRecebidoNoMes / entradasMesAtual.length : 0;
  const variacaoMes = totalMesAnterior > 0 ? ((totalRecebidoNoMes - totalMesAnterior) / totalMesAnterior) * 100 : null;

  const mesesGrafico = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - (5 - i), 1);
    const chave = d.toISOString().slice(0, 7);
    const label = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(d).replace(".", "");
    const valor = entradas.filter((e) => e.data.startsWith(chave)).reduce((acc, e) => acc + e.valor, 0);
    return { label: label.charAt(0).toUpperCase() + label.slice(1), valor };
  });

  const formasPagamentoMes = ["pix", "cartao", "dinheiro"]
    .map((forma) => ({
      forma,
      valor: entradasMesAtual.filter((e) => e.formaPagamentoChave === forma).reduce((acc, e) => acc + e.valor, 0),
    }))
    .filter((f) => f.valor > 0);

  const fretesPendentes = (fretes ?? []).filter((f) => f.status === "pendente");
  const totalFretePendente = fretesPendentes.reduce((acc, f) => acc + f.valor_custo, 0);
  const mesAtual = hojeStr.slice(0, 7);
  const totalFretePagoNoMes = (fretes ?? [])
    .filter((f) => f.status === "pago" && f.data_pagamento?.startsWith(mesAtual))
    .reduce((acc, f) => acc + f.valor_custo, 0);

  const vencendoHojeOuAtrasado = (contas ?? []).filter(
    (c) => c.status !== "pago" && c.vencimento <= hojeStr
  );
  const proximos7dias = (contas ?? []).filter(
    (c) => c.status !== "pago" && c.vencimento > hojeStr && c.vencimento <= em7dias.toISOString().slice(0, 10)
  );

  const totalVencendo = vencendoHojeOuAtrasado.reduce((acc, c) => acc + c.valor, 0);
  const totalProximos = proximos7dias.reduce((acc, c) => acc + c.valor, 0);

  // Saldo em caixa: soma de tudo que já entrou (desde o início) menos tudo
  // que já saiu (despesas, contas pagas, fretes pagos e retiradas).
  const totalEntradasGeral = entradas.reduce((acc, e) => acc + e.valor, 0);
  const totalDespesasGeral = (despesas ?? []).reduce((acc, d) => acc + d.valor, 0);
  const totalContasPagasGeral = (contas ?? []).filter((c) => c.status === "pago").reduce((acc, c) => acc + c.valor, 0);
  const totalFretesPagosGeral = (fretes ?? []).filter((f) => f.status === "pago").reduce((acc, f) => acc + f.valor_custo, 0);
  const totalRetiradasGeral = (retiradas ?? []).reduce((acc, r) => acc + r.valor, 0);
  const totalSaidasGeral = totalDespesasGeral + totalContasPagasGeral + totalFretesPagosGeral + totalRetiradasGeral;
  const saldoCaixa = totalEntradasGeral - totalSaidasGeral;

  const parceirosPendentes = Array.from(
    (itensParceiroPendentes ?? []).reduce((acc, item) => {
      if (!item.loja_parceira_id) return acc;
      const atual = acc.get(item.loja_parceira_id) ?? {
        lojaId: item.loja_parceira_id,
        lojaNome: item.lojas_parceiras?.nome ?? "Loja parceira",
        total: 0,
        itens: [],
      };
      const valorItem = item.quantidade * item.valor_unitario;
      atual.total += valorItem;
      atual.itens.push({
        id: item.id,
        descricao: item.descricao,
        valor: valorItem,
        osNumero: item.ordens_servico?.numero ?? null,
      });
      acc.set(item.loja_parceira_id, atual);
      return acc;
    }, new Map<string, ParceiroPendente>()).values()
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

      <Card className="mt-4 bg-gradient-to-br from-card to-accent/25">
        <CardContent className="flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between">
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
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
        <StatCard icon={TrendingUp} label="Recebido este mês" value={formatCurrency(totalRecebidoNoMes)} tone="success" />
        <StatCard icon={AlertTriangle} label="Vencendo Hoje/Atrasado" value={formatCurrency(totalVencendo)} tone="danger" />
        <StatCard icon={ClipboardList} label="Próximos 7 dias" value={formatCurrency(totalProximos)} />
      </div>

      <Tabs defaultValue="visao-geral" className="mt-5">
        <TabsList>
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="entradas">Entradas</TabsTrigger>
          <TabsTrigger value="contas">Contas a Pagar (Boletos)</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="retiradas">Retiradas</TabsTrigger>
          <TabsTrigger value="fretes">Fretes</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
            <StatCard
              icon={TrendingUp}
              label="Faturamento do mês"
              value={formatCurrency(totalRecebidoNoMes)}
              hint={new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(hoje)}
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
          <Card className="overflow-hidden p-0">
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Origem</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Forma de Pagamento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="w-10">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entradas.map((entrada) => (
                    <TableRow key={`${entrada.tipo}-${entrada.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {entrada.tipo === "os" ? (
                            <Wrench className="size-3.5 text-muted-foreground" />
                          ) : (
                            <ShoppingCart className="size-3.5 text-muted-foreground" />
                          )}
                          {entrada.origemHref ? (
                            <Link href={entrada.origemHref} className="font-medium text-primary">
                              {entrada.origemLabel}
                            </Link>
                          ) : (
                            <span className="font-medium text-foreground">{entrada.origemLabel}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">{entrada.cliente}</TableCell>
                      <TableCell className="text-muted-foreground">{entrada.data ? formatDate(entrada.data) : "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{entrada.formaPagamento}</TableCell>
                      <TableCell className="font-medium text-success">{formatCurrency(entrada.valor)}</TableCell>
                      <TableCell>
                        <ExcluirEntradaButton id={entrada.id} tipo={entrada.tipo} origemLabel={entrada.origemLabel} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {entradas.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                        Nenhuma entrada registrada ainda. Elas aparecem aqui quando uma OS é finalizada com pagamento ou
                        uma venda é feita no PDV.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col divide-y divide-border md:hidden">
              {entradas.map((entrada) => (
                <div key={`${entrada.tipo}-${entrada.id}`} className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {entrada.tipo === "os" ? (
                        <Wrench className="size-3.5 shrink-0 text-muted-foreground" />
                      ) : (
                        <ShoppingCart className="size-3.5 shrink-0 text-muted-foreground" />
                      )}
                      {entrada.origemHref ? (
                        <Link href={entrada.origemHref} className="truncate font-medium text-primary">
                          {entrada.origemLabel}
                        </Link>
                      ) : (
                        <span className="truncate font-medium text-foreground">{entrada.origemLabel}</span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm text-foreground">{entrada.cliente}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {entrada.data ? formatDate(entrada.data) : "—"} · {entrada.formaPagamento}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-success">{formatCurrency(entrada.valor)}</p>
                  </div>
                  <ExcluirEntradaButton id={entrada.id} tipo={entrada.tipo} origemLabel={entrada.origemLabel} />
                </div>
              ))}
              {entradas.length === 0 && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Nenhuma entrada registrada ainda. Elas aparecem aqui quando uma OS é finalizada com pagamento ou uma
                  venda é feita no PDV.
                </p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="contas">
          <div className="mb-3 flex justify-end gap-2">
            <ExportarCsvButton tipo="contas" />
            <NovaContaDialog />
          </div>
          <Card className="overflow-hidden p-0">
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(contas ?? []).map((conta) => {
                    const atrasado = conta.status !== "pago" && conta.vencimento < hojeStr;
                    const statusInfo = contaStatusMap[(atrasado ? "atrasado" : conta.status) as ContaStatus];
                    return (
                      <TableRow key={conta.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{conta.descricao}</p>
                            {conta.parcela_total && (
                              <Badge variant="secondary">
                                {conta.parcela_atual}/{conta.parcela_total}
                              </Badge>
                            )}
                          </div>
                          {conta.fornecedor && <p className="text-xs text-muted-foreground">{conta.fornecedor}</p>}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{conta.categoria || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(conta.vencimento)}</TableCell>
                        <TableCell className="font-medium text-foreground">{formatCurrency(conta.valor)}</TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {conta.status !== "pago" && <MarcarPagoButton id={conta.id} />}
                            <ExcluirContaButton id={conta.id} descricao={conta.descricao} />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(contas ?? []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                        Nenhuma conta cadastrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col divide-y divide-border md:hidden">
              {(contas ?? []).map((conta) => {
                const atrasado = conta.status !== "pago" && conta.vencimento < hojeStr;
                const statusInfo = contaStatusMap[(atrasado ? "atrasado" : conta.status) as ContaStatus];
                return (
                  <div key={conta.id} className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium text-foreground">{conta.descricao}</p>
                        {conta.parcela_total && (
                          <Badge variant="secondary" className="shrink-0">
                            {conta.parcela_atual}/{conta.parcela_total}
                          </Badge>
                        )}
                      </div>
                      {conta.fornecedor && <p className="text-xs text-muted-foreground">{conta.fornecedor}</p>}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {conta.categoria || "—"} · Vence {formatDate(conta.vencimento)}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        <span className="text-sm font-semibold text-foreground">{formatCurrency(conta.valor)}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {conta.status !== "pago" && <MarcarPagoButton id={conta.id} />}
                      <ExcluirContaButton id={conta.id} descricao={conta.descricao} />
                    </div>
                  </div>
                );
              })}
              {(contas ?? []).length === 0 && (
                <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma conta cadastrada.</p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="despesas">
          <div className="mb-3 flex justify-end">
            <ExportarCsvButton tipo="despesas" />
          </div>
          <Card className="overflow-hidden p-0">
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="w-10">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(despesas ?? []).map((despesa) => (
                    <TableRow key={despesa.id}>
                      <TableCell className="font-medium text-foreground">{despesa.descricao}</TableCell>
                      <TableCell className="text-muted-foreground">{despesa.categoria || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(despesa.data)}</TableCell>
                      <TableCell className="font-medium text-foreground">{formatCurrency(despesa.valor)}</TableCell>
                      <TableCell>
                        <ExcluirDespesaButton id={despesa.id} descricao={despesa.descricao} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {(despesas ?? []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                        Nenhuma despesa lançada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col divide-y divide-border md:hidden">
              {(despesas ?? []).map((despesa) => (
                <div key={despesa.id} className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{despesa.descricao}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {despesa.categoria || "—"} · {formatDate(despesa.data)}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{formatCurrency(despesa.valor)}</p>
                  </div>
                  <ExcluirDespesaButton id={despesa.id} descricao={despesa.descricao} />
                </div>
              ))}
              {(despesas ?? []).length === 0 && (
                <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma despesa lançada.</p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="retiradas" className="flex flex-col gap-4">
          {parceirosPendentes.length > 0 && (
            <div>
              <p className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Store className="size-4 text-primary" />
                Acerto com Parceiros
              </p>
              <div className="flex flex-col gap-3">
                {parceirosPendentes.map((parceiro) => (
                  <Card key={parceiro.lojaId}>
                    <CardContent className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{parceiro.lojaNome}</p>
                          <p className="text-xs text-muted-foreground">
                            {parceiro.itens.length} {parceiro.itens.length === 1 ? "item pendente" : "itens pendentes"}
                          </p>
                        </div>
                        <FecharContaParceiroButton
                          lojaParceiraId={parceiro.lojaId}
                          lojaNome={parceiro.lojaNome}
                          total={parceiro.total}
                        />
                      </div>
                      <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
                        {parceiro.itens.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                            <span className="truncate text-foreground">
                              {item.descricao}
                              {item.osNumero && (
                                <span className="text-muted-foreground"> · OS #OS-{String(item.osNumero).padStart(4, "0")}</span>
                              )}
                            </span>
                            <span className="shrink-0 font-medium text-foreground">{formatCurrency(item.valor)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Retiradas lançadas</p>
              <LancarRetiradaDialog />
            </div>
            <Card className="overflow-hidden p-0">
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead className="w-10">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(retiradas ?? []).map((retirada) => {
                      const tipoInfo = retiradaTipoMap[retirada.tipo as RetiradaTipo];
                      return (
                        <TableRow key={retirada.id}>
                          <TableCell className="font-medium text-foreground">{retirada.descricao}</TableCell>
                          <TableCell>
                            <Badge variant={tipoInfo.variant}>{tipoInfo.label}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(retirada.data)}</TableCell>
                          <TableCell className="font-medium text-foreground">{formatCurrency(retirada.valor)}</TableCell>
                          <TableCell>
                            <ExcluirRetiradaButton id={retirada.id} descricao={retirada.descricao} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {(retiradas ?? []).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                          Nenhuma retirada lançada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col divide-y divide-border md:hidden">
                {(retiradas ?? []).map((retirada) => {
                  const tipoInfo = retiradaTipoMap[retirada.tipo as RetiradaTipo];
                  return (
                    <div key={retirada.id} className="flex items-start justify-between gap-3 p-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">{retirada.descricao}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant={tipoInfo.variant}>{tipoInfo.label}</Badge>
                          <span className="text-xs text-muted-foreground">{formatDate(retirada.data)}</span>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-foreground">{formatCurrency(retirada.valor)}</p>
                      </div>
                      <ExcluirRetiradaButton id={retirada.id} descricao={retirada.descricao} />
                    </div>
                  );
                })}
                {(retiradas ?? []).length === 0 && (
                  <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma retirada lançada.</p>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fretes">
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatCard icon={AlertTriangle} label="Pendente de pagamento" value={formatCurrency(totalFretePendente)} tone="danger" />
            <StatCard icon={Truck} label="Pago este mês" value={formatCurrency(totalFretePagoNoMes)} />
          </div>
          <Card className="overflow-hidden p-0">
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>OS</TableHead>
                    <TableHead>Prestador</TableHead>
                    <TableHead>Cobrado do cliente</TableHead>
                    <TableHead>Pago ao prestador</TableHead>
                    <TableHead>Margem</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(fretes ?? []).map((frete) => {
                    const statusInfo = freteStatusMap[frete.status];
                    const cobrado = frete.ordens_servico?.valor_frete ?? 0;
                    const margem = cobrado - frete.valor_custo;
                    return (
                      <TableRow key={frete.id}>
                        <TableCell className="font-semibold text-primary">
                          {frete.ordens_servico && (
                            <Link href={`/ordens-servico/${frete.os_id}`}>
                              #OS-{String(frete.ordens_servico.numero).padStart(4, "0")}
                            </Link>
                          )}
                        </TableCell>
                        <TableCell className="text-foreground">{frete.prestadores_frete?.nome ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{formatCurrency(cobrado)}</TableCell>
                        <TableCell className="font-medium text-foreground">{formatCurrency(frete.valor_custo)}</TableCell>
                        <TableCell className={margem >= 0 ? "text-success" : "text-destructive"}>
                          {formatCurrency(margem)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </TableCell>
                        <TableCell>
                          {frete.status === "pendente" && <MarcarFretePagoButton freteId={frete.id} osId={frete.os_id} />}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(fretes ?? []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                        Nenhum frete registrado ainda. Eles aparecem aqui quando você define a origem &quot;Frete&quot;
                        numa OS.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col divide-y divide-border md:hidden">
              {(fretes ?? []).map((frete) => {
                const statusInfo = freteStatusMap[frete.status];
                const cobrado = frete.ordens_servico?.valor_frete ?? 0;
                const margem = cobrado - frete.valor_custo;
                return (
                  <div key={frete.id} className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      {frete.ordens_servico && (
                        <Link href={`/ordens-servico/${frete.os_id}`} className="font-semibold text-primary">
                          #OS-{String(frete.ordens_servico.numero).padStart(4, "0")}
                        </Link>
                      )}
                      <p className="mt-0.5 text-sm text-foreground">{frete.prestadores_frete?.nome ?? "—"}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Cobrado {formatCurrency(cobrado)} · Pago {formatCurrency(frete.valor_custo)}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        <span className={cn("text-sm font-semibold", margem >= 0 ? "text-success" : "text-destructive")}>
                          Margem {formatCurrency(margem)}
                        </span>
                      </div>
                    </div>
                    {frete.status === "pendente" && <MarcarFretePagoButton freteId={frete.id} osId={frete.os_id} />}
                  </div>
                );
              })}
              {(fretes ?? []).length === 0 && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Nenhum frete registrado ainda. Eles aparecem aqui quando você define a origem &quot;Frete&quot; numa
                  OS.
                </p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
