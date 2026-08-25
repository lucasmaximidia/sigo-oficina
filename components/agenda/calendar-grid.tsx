import Link from "next/link";
import { cn } from "@/lib/utils";
import { weekdayLabels, type CalendarDay } from "@/lib/calendar";
import type { AgendaEvento } from "@/types";

const tipoDotClass: Record<string, string> = {
  servico_domicilio: "bg-warning",
  frete: "bg-info",
  visita: "bg-primary",
  oficina: "bg-muted-foreground",
};

// Destaca visualmente os dias com agendamento conforme a proximidade: hoje em
// vermelho, próximos 2 dias em laranja, o resto sem destaque extra.
export function urgenciaBordaClass(iso: string, hojeIso: string, temEventos: boolean): string {
  if (!temEventos || iso < hojeIso) return "border-l-transparent";
  const diffDias = Math.round((new Date(`${iso}T00:00:00`).getTime() - new Date(`${hojeIso}T00:00:00`).getTime()) / 86400000);
  if (diffDias === 0) return "border-l-destructive";
  if (diffDias <= 2) return "border-l-warning";
  return "border-l-transparent";
}

export function CalendarGrid({
  days,
  eventosPorDia,
  selectedIso,
  monthParam,
}: {
  days: CalendarDay[];
  eventosPorDia: Record<string, AgendaEvento[]>;
  selectedIso: string;
  monthParam: string;
}) {
  const hojeIso = new Date().toISOString().slice(0, 10);

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="grid grid-cols-7 border-b border-border bg-secondary/50">
        {weekdayLabels.map((d) => (
          <div key={d} className="px-2 py-2 text-center text-xs font-semibold text-muted-foreground">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const eventos = eventosPorDia[day.iso] ?? [];
          const isSelected = day.iso === selectedIso;
          return (
            <Link
              key={day.iso}
              href={`/agenda?month=${monthParam}&day=${day.iso}`}
              className={cn(
                "flex min-h-20 flex-col gap-1 border-b border-r border-l-[3px] border-border p-1.5 text-left transition-colors last:border-r-0 hover:bg-secondary/40 md:min-h-24 md:p-2",
                !day.inCurrentMonth && "bg-muted/40 text-muted-foreground/50",
                isSelected && "bg-accent",
                day.inCurrentMonth && urgenciaBordaClass(day.iso, hojeIso, eventos.length > 0)
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                  day.isToday && "bg-primary text-primary-foreground",
                  !day.isToday && day.inCurrentMonth && "text-foreground",
                  !day.inCurrentMonth && "text-muted-foreground/50"
                )}
              >
                {day.date.getDate()}
              </span>
              <div className="flex flex-col gap-0.5">
                {eventos.slice(0, 2).map((ev) => (
                  <span key={ev.id} className="hidden truncate rounded bg-card px-1 py-0.5 text-[10px] font-medium text-foreground shadow-sm md:block">
                    <span className={cn("mr-1 inline-block size-1.5 rounded-full", tipoDotClass[ev.tipo])} />
                    {new Date(ev.data_hora_inicio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                ))}
                {eventos.length > 0 && (
                  <span className="flex items-center gap-0.5 md:hidden">
                    {eventos.slice(0, 3).map((ev) => (
                      <span key={ev.id} className={cn("size-1.5 rounded-full", tipoDotClass[ev.tipo])} />
                    ))}
                  </span>
                )}
                {eventos.length > 2 && (
                  <span className="hidden text-[10px] text-muted-foreground md:block">+{eventos.length - 2} mais</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
