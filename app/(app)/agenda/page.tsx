import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, User, CalendarDays } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarGrid, urgenciaBordaClass } from "@/components/agenda/calendar-grid";
import { cn } from "@/lib/utils";
import { NovoAgendamentoDialog } from "@/components/agenda/novo-agendamento-dialog";
import { buildMonthGrid, monthLabels } from "@/lib/calendar";
import { agendaStatusMap } from "@/lib/status";
import type { AgendaEvento, AgendaStatus } from "@/types";

export const dynamic = "force-dynamic";

interface AgendaEventoComCliente extends AgendaEvento {
  clientes: { nome: string } | null;
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; day?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const [yearStr, monthStr] = (params.month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`).split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  const monthParam = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;

  const days = buildMonthGrid(year, monthIndex);
  const selectedIso = params.day ?? now.toISOString().slice(0, 10);

  const rangeStart = days[0].iso;
  const rangeEnd = days[days.length - 1].iso;

  const [{ data: eventosMes }, { data: clientes }] = await Promise.all([
    supabase
      .from("agenda_eventos")
      .select<string, AgendaEventoComCliente>("*, clientes(nome)")
      .gte("data_hora_inicio", `${rangeStart}T00:00:00`)
      .lte("data_hora_inicio", `${rangeEnd}T23:59:59`)
      .order("data_hora_inicio", { ascending: true }),
    supabase.from("clientes").select("id, nome").order("nome", { ascending: true }),
  ]);

  const eventosPorDia: Record<string, AgendaEventoComCliente[]> = {};
  for (const evento of eventosMes ?? []) {
    const iso = evento.data_hora_inicio.slice(0, 10);
    eventosPorDia[iso] = eventosPorDia[iso] ? [...eventosPorDia[iso], evento] : [evento];
  }

  const eventosDoDia = eventosPorDia[selectedIso] ?? [];

  const prevMonthDate = new Date(year, monthIndex - 1, 1);
  const nextMonthDate = new Date(year, monthIndex + 1, 1);
  const prevMonthParam = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;
  const nextMonthParam = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}`;

  const selectedDateLabel = new Date(`${selectedIso}T00:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });

  return (
    <div>
      <PageHeader title="Agenda" description="Serviços em domicílio, fretes e visitas agendadas." actions={<NovoAgendamentoDialog clientes={clientes ?? []} defaultDate={selectedIso} />} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-lg font-semibold text-foreground">
              {monthLabels[monthIndex]} {year}
            </p>
            <div className="flex items-center gap-1">
              <Link
                href={`/agenda?month=${prevMonthParam}`}
                className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary"
              >
                <ChevronLeft className="size-4" />
              </Link>
              <Link
                href={`/agenda?month=${nextMonthParam}`}
                className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary"
              >
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>
          <CalendarGrid days={days} eventosPorDia={eventosPorDia} selectedIso={selectedIso} monthParam={monthParam} />
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 capitalize">
              <CalendarDays className="size-4.5 shrink-0 text-primary" />
              {selectedDateLabel}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {eventosDoDia.length} {eventosDoDia.length === 1 ? "agendamento" : "agendamentos"}
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {eventosDoDia.length === 0 && <p className="text-sm text-muted-foreground">Nenhum agendamento neste dia.</p>}
            {eventosDoDia.map((evento) => {
              const cliente = Array.isArray(evento.clientes) ? evento.clientes[0] : evento.clientes;
              const status = agendaStatusMap[evento.status as AgendaStatus];
              return (
                <div
                  key={evento.id}
                  className={cn(
                    "rounded-xl border border-l-[3px] border-border p-3",
                    urgenciaBordaClass(selectedIso, new Date().toISOString().slice(0, 10), true)
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-primary">
                      {new Date(evento.data_hora_inicio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  <p className="mt-1 text-sm font-medium text-foreground">{evento.titulo}</p>
                  {cliente && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User className="size-3.5" />
                      {cliente.nome}
                    </p>
                  )}
                  {evento.endereco && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="size-3.5" />
                      {evento.endereco}
                    </p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
