import Link from "next/link";
import {
  Hourglass,
  Wrench,
  Package,
  PackageCheck,
  ReceiptText,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  Circle,
  ShoppingCart,
  Truck,
  ShieldAlert,
  FileText,
  LayoutGrid,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { TarefasCard } from "@/components/dashboard/tarefas-card";
import { LocacaoPainel, type AluguelPainel } from "@/components/dashboard/locacao-painel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { agoraMs, cn, diasAPartirDe, formatCurrency, formatDate, hojeBR, inicioDiaBR } from "@/lib/utils";
import { agendaStatusMap } from "@/lib/status";
import type { AgendaStatus } from "@/types";
import type { LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

// Quantos itens aparecem antes de recolher num link "+N" — os cards da
// seção "Hoje" dividem a largura em até 3 colunas, então a lista precisa
// ficar compacta; a tela cheia (agenda, financeiro) continua mostrando tudo.
const LIMITE_LISTA_HOJE = 3;

interface OsParadaRow {
  id: string;
  numero: number;
  problema_relatado: string | null;
  parada_motivo: string | null;
  updated_at: string;
  clientes: { nome: string } | null;
}

interface AgendaResumoRow {
  id: string;
  titulo: string;
  tipo: string;
  status: AgendaStatus;
  data_hora_inicio: string;
  endereco: string | null;
  tecnico: string | null;
  clientes: { nome: string } | null;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const hojeStr = hojeBR();
  const hoje = new Date(`${hojeStr}T00:00:00-03:00`);
  const amanhaStr = diasAPartirDe(hojeStr, 1);

  const { data: config } = await supabase.from("configuracoes").select("*").eq("id", 1).single();

  const boletosDias = config?.dashboard_boletos_dias ?? 3;
  const emBoletosDiasStr = diasAPartirDe(hojeStr, boletosDias);

  const mostrarStats = config?.dashboard_mostrar_stats ?? true;
  const mostrarAgenda = config?.dashboard_mostrar_agenda ?? true;
  const mostrarOsParadas = config?.dashboard_mostrar_os_paradas ?? true;
  const mostrarBoletosPendentes = config?.dashboard_mostrar_boletos_pendentes ?? true;
  const mostrarTarefas = config?.dashboard_mostrar_tarefas ?? true;
  const paradaDias = config?.dashboard_os_parada_dias ?? 3;
  const mostrarPdvHoje = config?.dashboard_mostrar_pdv_hoje ?? true;
  const mostrarFretesPendentes = config?.dashboard_mostrar_fretes_pendentes ?? true;
  const mostrarGarantiasVencendo = config?.dashboard_mostrar_garantias_vencendo ?? true;
  const mostrarOrcamentosPendentes = config?.dashboard_mostrar_orcamentos_pendentes ?? true;
  const mostrarExtras = mostrarPdvHoje || mostrarFretesPendentes || mostrarGarantiasVencendo || mostrarOrcamentosPendentes;
  const colunasHoje = [mostrarAgenda, mostrarOsParadas, mostrarBoletosPendentes].filter(Boolean).length;

  const limiteParadaStr = diasAPartirDe(hojeStr, -paradaDias);

  const [
    { count: aguardandoOrcamento },
    { count: aguardandoPecas },
    { count: emExecucao },
    { count: aguardandoPagamento },
    { data: boletosVencendo },
    { data: osParadas },
    { data: agendaHoje },
    { data: agendaAmanha },
    { data: tarefas },
    { count: locacaoVeiculosCount },
    { data: locacaoAlugueisAbertos },
  ] = await Promise.all([
    supabase.from("ordens_servico").select("id", { count: "exact", head: true }).eq("status", "aguardando_orcamento"),
    supabase.from("ordens_servico").select("id", { count: "exact", head: true }).eq("status", "aguardando_pecas"),
    supabase.from("ordens_servico").select("id", { count: "exact", head: true }).eq("status", "em_execucao"),
    supabase.from("ordens_servico").select("id", { count: "exact", head: true }).eq("status", "aguardando_pagamento"),
    supabase
      .from("financeiro_contas")
      .select("id, descricao, numero_documento, valor, vencimento, status, parcela_atual, parcela_total")
      .is("deletado_em", null)
      .neq("status", "pago")
      .lte("vencimento", emBoletosDiasStr)
      .order("vencimento", { ascending: true }),
    supabase
      .from("ordens_servico")
      .select<string, OsParadaRow>("id, numero, problema_relatado, parada_motivo, updated_at, clientes(nome)")
      .or(`parada.eq.true,updated_at.lt.${inicioDiaBR(limiteParadaStr)}`)
      .not("status", "in", "(finalizado,cancelado)")
      .order("updated_at", { ascending: true })
      .limit(5),
    supabase
      .from("agenda_eventos")
      .select<string, AgendaResumoRow>("id, titulo, tipo, status, data_hora_inicio, endereco, tecnico, clientes(nome)")
      .gte("data_hora_inicio", inicioDiaBR(hojeStr))
      .lt("data_hora_inicio", inicioDiaBR(amanhaStr))
      .order("data_hora_inicio", { ascending: true }),
    supabase
      .from("agenda_eventos")
      .select<string, AgendaResumoRow>("id, titulo, tipo, status, data_hora_inicio, endereco, tecnico, clientes(nome)")
      .gte("data_hora_inicio", inicioDiaBR(amanhaStr))
      .lt("data_hora_inicio", inicioDiaBR(diasAPartirDe(amanhaStr, 1)))
      .order("data_hora_inicio", { ascending: true }),
    supabase.from("tarefas").select("*").eq("data", hojeStr).order("created_at", { ascending: true }),
    supabase.from("locacao_veiculos").select("id", { count: "exact", head: true }),
    supabase
      .from("locacao_alugueis")
      .select(
        "id, data_prevista_devolucao, status_pagamento, locacao_veiculos(tipo, marca, modelo, cor), locacao_clientes(nome)"
      )
      .is("data_devolucao_real", null)
      .order("data_prevista_devolucao", { ascending: true }),
  ]);

  const alugueisPainel: AluguelPainel[] = (locacaoAlugueisAbertos ?? []).map((a) => {
    const veiculo = a.locacao_veiculos as unknown as {
      tipo: "scooter" | "bicicleta";
      marca: string;
      modelo: string;
      cor: string | null;
    } | null;
    const cliente = a.locacao_clientes as unknown as { nome: string } | null;
    return {
      id: a.id,
      veiculoTipo: veiculo?.tipo ?? "scooter",
      veiculoMarca: veiculo?.marca ?? "",
      veiculoModelo: veiculo?.modelo ?? "",
      veiculoCor: veiculo?.cor ?? null,
      clienteNome: cliente?.nome ?? "Cliente",
      dataPrevistaDevolucao: a.data_prevista_devolucao,
      statusPagamento: a.status_pagamento,
    };
  });

  const [{ data: vendasHoje }, { data: fretesPendentes }, { data: garantiasCriticas }, { count: orcamentosPendentes }] =
    await Promise.all([
      mostrarPdvHoje
        ? supabase
            .from("vendas_pdv")
            .select("total")
            .is("deletado_em", null)
            .gte("created_at", inicioDiaBR(hojeStr))
            .lt("created_at", inicioDiaBR(amanhaStr))
        : Promise.resolve({ data: null }),
      mostrarFretesPendentes ? supabase.from("fretes").select("valor_custo").eq("status", "pendente") : Promise.resolve({ data: null }),
      mostrarGarantiasVencendo
        ? supabase.from("vw_garantias").select("os_id").eq("status_garantia", "critica")
        : Promise.resolve({ data: null }),
      mostrarOrcamentosPendentes
        ? supabase.from("orcamentos").select("id", { count: "exact", head: true }).in("status", ["rascunho", "enviado"])
        : Promise.resolve({ count: null }),
    ]);

  const totalVendasHoje = (vendasHoje ?? []).reduce((acc, v) => acc + v.total, 0);
  const totalFretesPendentes = (fretesPendentes ?? []).reduce((acc, f) => acc + f.valor_custo, 0);

  const agora = agoraMs();
  const diasParado = (updatedAt: string) => {
    return Math.floor((agora - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div>
      <PageHeader
        title="Visão Geral"
        description="Resumo das atividades e pendências de hoje."
        actions={
          <Badge variant="outline" className="h-9 gap-1.5 rounded-xl px-3 text-sm font-medium">
            <CalendarDays className="size-4" />
            Hoje, {formatDate(hoje)}
          </Badge>
        }
      />

      {mostrarStats && (
        <Card className="bg-gradient-to-br from-card to-accent/25">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="size-4.5 text-primary" />
              Acompanhamento de OS
            </CardTitle>
            <Link href="/ordens-servico?view=kanban" className="text-sm font-medium text-primary hover:underline">
              Ver Kanban
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniStat icon={Hourglass} label="Aguardando Orçamento" value={aguardandoOrcamento ?? 0} />
              <MiniStat icon={Package} label="Aguardando Peças" value={aguardandoPecas ?? 0} tone="action" />
              <MiniStat icon={Wrench} label="Em Execução" value={emExecucao ?? 0} tone="success" />
              <MiniStat icon={PackageCheck} label="Aguardando Pagamento" value={aguardandoPagamento ?? 0} tone="warning" />
            </div>
          </CardContent>
        </Card>
      )}

      {(locacaoVeiculosCount ?? 0) > 0 && (
        <div className="mt-4 lg:mt-6">
          <LocacaoPainel alugueis={alugueisPainel} />
        </div>
      )}

      {(mostrarAgenda || mostrarOsParadas || mostrarBoletosPendentes) && (
        <div
          className={cn(
            "mt-4 grid grid-cols-1 gap-4 lg:mt-6",
            colunasHoje === 3 ? "lg:grid-cols-3" : colunasHoje === 2 ? "lg:grid-cols-2" : "lg:grid-cols-1"
          )}
        >
          {mostrarAgenda && (
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="size-4.5 text-primary" />
                  Agenda
                </CardTitle>
                <Link href="/agenda" className="text-sm font-medium text-primary hover:underline">
                  Ver
                </Link>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <AgendaResumo eventos={agendaHoje ?? []} rotulo="Hoje" vazio="Nenhum compromisso hoje." />
                <AgendaResumo eventos={agendaAmanha ?? []} rotulo="Amanhã" vazio="Nenhum compromisso amanhã." />
              </CardContent>
            </Card>
          )}

          {mostrarOsParadas && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="size-4.5" />
                  OS Paradas
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {(osParadas ?? []).length === 0 && (
                  <EmptyState icon={<CheckCircle2 className="size-4.5" />} title="Nenhuma OS parada no momento" className="py-4" />
                )}
                {(osParadas ?? []).map((os) => (
                  <Link
                    key={os.id}
                    href={`/ordens-servico/${os.id}`}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary/50"
                  >
                    <Circle className="size-2 shrink-0 fill-destructive text-destructive" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        OS #{os.numero} · {diasParado(os.updated_at)}d parada
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {os.parada_motivo || os.problema_relatado || "Sem detalhes"}
                      </p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {mostrarBoletosPendentes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <ReceiptText className="size-4.5" />
                  Boletos Pendentes
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Atrasados e vencendo em {boletosDias} {boletosDias === 1 ? "dia" : "dias"}.
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                {(boletosVencendo ?? []).length === 0 && (
                  <EmptyState icon={<ReceiptText className="size-4.5" />} title="Nenhum boleto vencendo" className="py-4" />
                )}
                {(boletosVencendo ?? []).slice(0, LIMITE_LISTA_HOJE).map((conta) => {
                  const atrasado = conta.vencimento < hojeStr;
                  return (
                    <Link
                      key={conta.id}
                      href="/financeiro"
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary/50"
                    >
                      <Circle
                        className={`size-2 shrink-0 ${atrasado ? "fill-destructive text-destructive" : "fill-warning text-warning"}`}
                      />
                      <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                        {conta.descricao}
                        {conta.parcela_total ? ` (${conta.parcela_atual}/${conta.parcela_total})` : ""}
                      </p>
                      <p className="shrink-0 text-sm font-semibold text-foreground">{formatCurrency(conta.valor)}</p>
                    </Link>
                  );
                })}
                {(boletosVencendo ?? []).length > LIMITE_LISTA_HOJE && (
                  <Link href="/financeiro" className="mt-1 px-2 text-xs font-medium text-primary hover:underline">
                    +{(boletosVencendo ?? []).length - LIMITE_LISTA_HOJE} boleto(s)
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {mostrarExtras && (
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:mt-6">
          {mostrarPdvHoje && (
            <Link href="/pdv">
              <StatCard icon={ShoppingCart} label="Vendas do PDV hoje" value={formatCurrency(totalVendasHoje)} hint={`${vendasHoje?.length ?? 0} vendas`} />
            </Link>
          )}
          {mostrarFretesPendentes && (
            <Link href="/financeiro">
              <StatCard icon={Truck} label="Fretes Pendentes" value={formatCurrency(totalFretesPendentes)} hint={`${fretesPendentes?.length ?? 0} a pagar`} />
            </Link>
          )}
          {mostrarGarantiasVencendo && (
            <Link href="/garantias">
              <StatCard icon={ShieldAlert} label="Garantias Vencendo" value={garantiasCriticas?.length ?? 0} hint="Nos próximos 15 dias" />
            </Link>
          )}
          {mostrarOrcamentosPendentes && (
            <Link href="/orcamentos">
              <StatCard icon={FileText} label="Orçamentos Pendentes" value={orcamentosPendentes ?? 0} hint="Aguardando resposta" />
            </Link>
          )}
        </div>
      )}

      {mostrarTarefas && (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-6">
          <TarefasCard tarefas={tarefas ?? []} />
        </div>
      )}
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  tone?: "default" | "action" | "success" | "warning";
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-3.5",
        tone === "action" && "bg-gradient-to-br from-action/15 to-action/5",
        tone === "success" && "bg-gradient-to-br from-success/15 to-success/5",
        tone === "warning" && "bg-gradient-to-br from-warning/20 to-warning/5",
        tone === "default" && "bg-gradient-to-br from-accent to-accent/40"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -top-6 -right-6 size-20 rounded-full blur-2xl",
          tone === "action" && "bg-action/20",
          tone === "success" && "bg-success/20",
          tone === "warning" && "bg-warning/20",
          tone === "default" && "bg-primary/15"
        )}
      />
      <div
        className={cn(
          "relative flex size-8 items-center justify-center rounded-lg bg-card/80 shadow-sm",
          tone === "action" && "text-action",
          tone === "success" && "text-success",
          tone === "warning" && "text-warning",
          tone === "default" && "text-primary"
        )}
      >
        <Icon className="size-4" strokeWidth={2} />
      </div>
      <p className="font-display relative mt-2.5 text-2xl font-bold text-foreground">{value}</p>
      <p className="relative text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

// Mesmos tokens de cor do Badge, só que como bolinha — cabe muito mais
// compromisso por linha do que um Badge inteiro ao lado de cada horário.
const STATUS_DOT: Record<string, string> = {
  secondary: "bg-secondary-foreground/40",
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
  destructive: "bg-destructive",
};

function AgendaResumo({
  eventos,
  rotulo,
  vazio,
}: {
  eventos: {
    id: string;
    titulo: string;
    status: keyof typeof agendaStatusMap;
    data_hora_inicio: string;
  }[];
  rotulo: string;
  vazio: string;
}) {
  const visiveis = eventos.slice(0, LIMITE_LISTA_HOJE);
  const restantes = eventos.length - visiveis.length;

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{rotulo}</p>
      {eventos.length === 0 ? (
        <p className="px-2 py-1 text-sm text-muted-foreground">{vazio}</p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {visiveis.map((evento) => {
            const status = agendaStatusMap[evento.status];
            return (
              <div key={evento.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                <span className="w-11 shrink-0 text-xs font-semibold text-primary">
                  {new Date(evento.data_hora_inicio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className={cn("size-1.75 shrink-0 rounded-full", status ? STATUS_DOT[status.variant] : "bg-muted-foreground/40")} />
                <p className="min-w-0 flex-1 truncate text-sm text-foreground">{evento.titulo}</p>
              </div>
            );
          })}
          {restantes > 0 && (
            <Link href="/agenda" className="px-2 text-xs font-medium text-primary hover:underline">
              +{restantes} agendamento{restantes === 1 ? "" : "s"}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
