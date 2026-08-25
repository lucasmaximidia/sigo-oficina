import Link from "next/link";
import {
  Hourglass,
  Wrench,
  Package,
  PackageCheck,
  ReceiptText,
  CalendarDays,
  AlertTriangle,
  Circle,
  ShoppingCart,
  Truck,
  ShieldAlert,
  FileText,
  LayoutGrid,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { TarefasCard } from "@/components/dashboard/tarefas-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { agendaStatusMap } from "@/lib/status";
import type { AgendaStatus } from "@/types";
import type { LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

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
  const hoje = new Date();
  const hojeStr = hoje.toISOString().slice(0, 10);
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);
  const amanhaStr = amanha.toISOString().slice(0, 10);

  const { data: config } = await supabase.from("configuracoes").select("*").eq("id", 1).single();

  const boletosDias = config?.dashboard_boletos_dias ?? 3;
  const emBoletosDias = new Date(hoje);
  emBoletosDias.setDate(emBoletosDias.getDate() + boletosDias);

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

  const limiteParada = new Date(hoje);
  limiteParada.setDate(limiteParada.getDate() - paradaDias);

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
      .lte("vencimento", emBoletosDias.toISOString().slice(0, 10))
      .order("vencimento", { ascending: true }),
    supabase
      .from("ordens_servico")
      .select<string, OsParadaRow>("id, numero, problema_relatado, parada_motivo, updated_at, clientes(nome)")
      .or(`parada.eq.true,updated_at.lt.${limiteParada.toISOString()}`)
      .not("status", "in", "(finalizado,cancelado)")
      .order("updated_at", { ascending: true })
      .limit(5),
    supabase
      .from("agenda_eventos")
      .select<string, AgendaResumoRow>("id, titulo, tipo, status, data_hora_inicio, endereco, tecnico, clientes(nome)")
      .gte("data_hora_inicio", `${hojeStr}T00:00:00`)
      .lt("data_hora_inicio", `${amanhaStr}T00:00:00`)
      .order("data_hora_inicio", { ascending: true }),
    supabase
      .from("agenda_eventos")
      .select<string, AgendaResumoRow>("id, titulo, tipo, status, data_hora_inicio, endereco, tecnico, clientes(nome)")
      .gte("data_hora_inicio", `${amanhaStr}T00:00:00`)
      .lt("data_hora_inicio", `${amanhaStr}T23:59:59`)
      .order("data_hora_inicio", { ascending: true }),
    supabase.from("tarefas").select("*").eq("data", hojeStr).order("created_at", { ascending: true }),
  ]);

  const [{ data: vendasHoje }, { data: fretesPendentes }, { data: garantiasCriticas }, { count: orcamentosPendentes }] =
    await Promise.all([
      mostrarPdvHoje
        ? supabase
            .from("vendas_pdv")
            .select("total")
            .is("deletado_em", null)
            .gte("created_at", `${hojeStr}T00:00:00`)
            .lt("created_at", `${amanhaStr}T00:00:00`)
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

  const diasParado = (updatedAt: string) => {
    return Math.floor((hoje.getTime() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24));
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
              <MiniStat icon={Package} label="Aguardando Peças" value={aguardandoPecas ?? 0} />
              <MiniStat icon={Wrench} label="Em Execução" value={emExecucao ?? 0} />
              <MiniStat icon={PackageCheck} label="Aguardando Pagamento" value={aguardandoPagamento ?? 0} tone="warning" />
            </div>
          </CardContent>
        </Card>
      )}

      {(mostrarAgenda || mostrarOsParadas) && (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:mt-6">
          {mostrarAgenda && (
            <Card className={mostrarOsParadas ? "lg:col-span-2" : "lg:col-span-3"}>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="size-4.5 text-primary" />
                  Agenda
                </CardTitle>
                <Link href="/agenda" className="text-sm font-medium text-primary hover:underline">
                  Ver calendário
                </Link>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hoje</p>
                  <AgendaList eventos={agendaHoje ?? []} vazio="Nenhum compromisso para hoje." urgencia="hoje" />
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amanhã</p>
                  <AgendaList eventos={agendaAmanha ?? []} vazio="Nenhum compromisso para amanhã." urgencia="amanha" />
                </div>
              </CardContent>
            </Card>
          )}

          {mostrarOsParadas && (
            <Card className={mostrarAgenda ? "" : "lg:col-span-3"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="size-4.5" />
                  OS Paradas
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {(osParadas ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma OS parada no momento.</p>
                )}
                {(osParadas ?? []).map((os) => (
                  <Link
                    key={os.id}
                    href={`/ordens-servico/${os.id}`}
                    className="block rounded-lg border border-border p-3 transition-colors hover:border-primary/40 hover:bg-secondary/40"
                  >
                    <div className="flex items-center gap-2">
                      <Circle className="size-2 shrink-0 fill-destructive text-destructive" />
                      <p className="text-sm font-semibold text-foreground">
                        OS #{os.numero} · Parada há {diasParado(os.updated_at)} dias
                      </p>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {os.parada_motivo || os.problema_relatado || "Sem detalhes"}
                    </p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {mostrarBoletosPendentes && (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <ReceiptText className="size-4.5" />
                Boletos Pendentes
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Atrasados e vencendo nos próximos {boletosDias} {boletosDias === 1 ? "dia" : "dias"}.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {(boletosVencendo ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum boleto vencendo nos próximos {boletosDias} dias.</p>
              )}
              {(boletosVencendo ?? []).map((conta) => {
                const atrasado = conta.vencimento < hojeStr;
                return (
                  <Link
                    key={conta.id}
                    href="/financeiro"
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary/40 hover:bg-secondary/40"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Circle
                          className={`size-2 shrink-0 ${atrasado ? "fill-destructive text-destructive" : "fill-warning text-warning"}`}
                        />
                        <p className="truncate text-sm font-semibold text-foreground">
                          {conta.descricao}
                          {conta.parcela_total ? ` (${conta.parcela_atual}/${conta.parcela_total})` : ""}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {atrasado ? "Venceu em" : "Vence em"} {formatDate(conta.vencimento)}
                        {conta.numero_documento ? ` · NF ${conta.numero_documento}` : ""}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-foreground">{formatCurrency(conta.valor)}</p>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
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
  tone?: "default" | "warning";
}) {
  return (
    <div className="rounded-xl bg-card/70 p-3.5">
      <div
        className={cn(
          "flex size-8 items-center justify-center rounded-lg",
          tone === "warning" ? "bg-warning/15 text-warning" : "bg-accent text-primary"
        )}
      >
        <Icon className="size-4" strokeWidth={2} />
      </div>
      <p className="font-display mt-2.5 text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function AgendaList({
  eventos,
  vazio,
  urgencia,
}: {
  eventos: {
    id: string;
    titulo: string;
    tipo: string;
    status: keyof typeof agendaStatusMap;
    data_hora_inicio: string;
    endereco: string | null;
    clientes: { nome: string } | { nome: string }[] | null;
  }[];
  vazio: string;
  urgencia: "hoje" | "amanha";
}) {
  if (eventos.length === 0) {
    return <p className="text-sm text-muted-foreground">{vazio}</p>;
  }
  const corBorda = urgencia === "hoje" ? "border-l-destructive" : "border-l-warning";
  return (
    <div className="flex flex-col gap-2">
      {eventos.map((evento) => {
        const cliente = Array.isArray(evento.clientes) ? evento.clientes[0] : evento.clientes;
        const status = agendaStatusMap[evento.status];
        return (
          <div key={evento.id} className={`flex gap-3 rounded-lg border border-l-[3px] border-border p-3 ${corBorda}`}>
            <div className="w-14 shrink-0 text-sm font-semibold text-primary">
              {new Date(evento.data_hora_inicio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-foreground">{evento.titulo}</p>
                {status && <Badge variant={status.variant}>{status.label}</Badge>}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {cliente?.nome ?? "Sem cliente"}
                {evento.endereco ? ` · ${evento.endereco}` : ""}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
