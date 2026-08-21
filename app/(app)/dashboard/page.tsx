import Link from "next/link";
import { Hourglass, Wrench, PackageCheck, ReceiptText, CalendarDays, AlertTriangle, Circle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { TarefasCard } from "@/components/dashboard/tarefas-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { agendaStatusMap } from "@/lib/status";
import type { AgendaStatus } from "@/types";

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
  const em3dias = new Date(hoje);
  em3dias.setDate(em3dias.getDate() + 3);

  const [
    { count: aguardandoOrcamento },
    { count: emExecucao },
    { count: aguardandoPagamento },
    { data: boletosVencendo },
    { data: osParadas },
    { data: agendaHoje },
    { data: agendaAmanha },
    { data: tarefas },
  ] = await Promise.all([
    supabase.from("ordens_servico").select("id", { count: "exact", head: true }).eq("status", "aguardando_orcamento"),
    supabase.from("ordens_servico").select("id", { count: "exact", head: true }).eq("status", "em_execucao"),
    supabase.from("ordens_servico").select("id", { count: "exact", head: true }).eq("status", "aguardando_pagamento"),
    supabase
      .from("financeiro_contas")
      .select("id, descricao, valor, vencimento, status")
      .neq("status", "pago")
      .lte("vencimento", em3dias.toISOString().slice(0, 10))
      .order("vencimento", { ascending: true }),
    supabase
      .from("ordens_servico")
      .select<string, OsParadaRow>("id, numero, problema_relatado, parada_motivo, updated_at, clientes(nome)")
      .eq("parada", true)
      .neq("status", "finalizado")
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

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard icon={Hourglass} label="Aguardando Orçamento" value={aguardandoOrcamento ?? 0} hint="OS para análise" />
        <StatCard icon={Wrench} label="OS em Aberto" value={emExecucao ?? 0} hint="Em execução/fila" />
        <StatCard icon={PackageCheck} label="Aguardando Pagamento" value={aguardandoPagamento ?? 0} hint="Prontas para retirada" />
        <StatCard
          icon={ReceiptText}
          label="Boletos Vencendo"
          value={boletosVencendo?.length ?? 0}
          hint="Próximos 3 dias"
          tone="danger"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:mt-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Agenda</CardTitle>
            <Link href="/agenda" className="text-sm font-medium text-primary hover:underline">
              Ver calendário
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hoje</p>
              <AgendaList eventos={agendaHoje ?? []} vazio="Nenhum compromisso para hoje." />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amanhã</p>
              <AgendaList eventos={agendaAmanha ?? []} vazio="Nenhum compromisso para amanhã." />
            </div>
          </CardContent>
        </Card>

        <Card>
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
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-6">
        <TarefasCard tarefas={tarefas ?? []} />
      </div>
    </div>
  );
}

function AgendaList({
  eventos,
  vazio,
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
}) {
  if (eventos.length === 0) {
    return <p className="text-sm text-muted-foreground">{vazio}</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      {eventos.map((evento) => {
        const cliente = Array.isArray(evento.clientes) ? evento.clientes[0] : evento.clientes;
        const status = agendaStatusMap[evento.status];
        return (
          <div key={evento.id} className="flex gap-3 rounded-lg border border-border p-3">
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
