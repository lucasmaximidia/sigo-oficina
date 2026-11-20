"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface PontoFaturamento {
  dia: string;
  valor: number;
}

// Gráfico de barras simples (1 série) — sem legenda, já que o título do
// card identifica a série (ver skill dataviz: legenda não é necessária com
// uma série só). Cor única do design system (--primary), barras finas com
// topo arredondado, eixo e grade recessivos, tooltip no hover.
export function FaturamentoChart({ pontos }: { pontos: PontoFaturamento[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (pontos.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Sem dados no período.</p>;
  }

  const max = Math.max(...pontos.map((p) => p.valor), 1);

  return (
    <div className="relative">
      <div className="flex h-40 items-end gap-1 border-b border-border">
        {pontos.map((p, i) => {
          const alturaPct = (p.valor / max) * 100;
          return (
            <div
              key={p.dia}
              className="group relative flex-1"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {hoverIndex === i && (
                <div className="absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-xs shadow-sm">
                  <span className="font-medium">{formatCurrency(p.valor)}</span>{" "}
                  <span className="text-muted-foreground">{formatDate(p.dia)}</span>
                </div>
              )}
              <div
                className="mx-auto w-full rounded-t-[4px] bg-primary transition-opacity group-hover:opacity-80"
                style={{ height: `${Math.max(alturaPct, p.valor > 0 ? 2 : 0)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-1">
        {pontos.map((p) => (
          <div key={p.dia} className="flex-1 text-center text-[10px] text-muted-foreground">
            {pontos.length <= 15 ? formatDate(p.dia).slice(0, 5) : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
