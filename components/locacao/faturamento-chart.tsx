"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface PontoFaturamento {
  dia: string;
  valor: number;
}

export interface SerieFaturamento {
  id: string;
  label: string;
  pontos: PontoFaturamento[];
}

// 8 matizes categóricos validados (ver app/globals.css --chart-1..8) — nunca
// ciclados; a 9ª série em diante dobra pra cinza neutro. Ver skill de dataviz.
const CORES_ORDENADAS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
  "var(--color-chart-7)",
  "var(--color-chart-8)",
];
const COR_OUTROS = "var(--color-chart-outros)";

// Gráfico de barras — 1 série (cor única do design system, sem legenda,
// já que o título do card identifica a série) ou várias (1 cor fixa por
// carrinho + legenda), agrupadas por dia. Barras finas, topo arredondado,
// eixo recessivo, tooltip no hover (ver skill dataviz).
export function FaturamentoChart({ series }: { series: SerieFaturamento[] }) {
  const [hover, setHover] = useState<{ dia: string; serieId: string } | null>(null);

  const comDados = series.filter((s) => s.pontos.some((p) => p.valor > 0));
  if (comDados.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Sem dados no período.</p>;
  }

  const multiplasSeries = comDados.length > 1;
  const cores = new Map<string, string>();
  comDados.forEach((s, i) => cores.set(s.id, i < 8 ? CORES_ORDENADAS[i] : COR_OUTROS));

  const dias = Array.from(new Set(comDados.flatMap((s) => s.pontos.map((p) => p.dia)))).sort((a, b) =>
    a.localeCompare(b)
  );
  const valorPorSerieDia = new Map<string, number>();
  for (const s of comDados) for (const p of s.pontos) valorPorSerieDia.set(`${s.id}|${p.dia}`, p.valor);

  const max = Math.max(...comDados.flatMap((s) => s.pontos.map((p) => p.valor)), 1);

  return (
    <div>
      <div className="flex h-40 items-end gap-2 border-b border-border">
        {dias.map((dia) => (
          <div key={dia} className="flex flex-1 items-end justify-center gap-0.5">
            {comDados.map((s) => {
              const valor = valorPorSerieDia.get(`${s.id}|${dia}`) ?? 0;
              const alturaPct = (valor / max) * 100;
              const ativo = hover?.dia === dia && hover.serieId === s.id;
              return (
                <div
                  key={s.id}
                  className="group relative h-full flex-1"
                  onMouseEnter={() => setHover({ dia, serieId: s.id })}
                  onMouseLeave={() => setHover(null)}
                >
                  {ativo && (
                    <div className="absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-xs shadow-sm">
                      {multiplasSeries && <span className="font-medium">{s.label}</span>}{" "}
                      <span className="font-medium">{formatCurrency(valor)}</span>{" "}
                      <span className="text-muted-foreground">{formatDate(dia)}</span>
                    </div>
                  )}
                  <div
                    className="absolute bottom-0 w-full rounded-t-[4px] transition-opacity group-hover:opacity-80"
                    style={{ height: `${Math.max(alturaPct, valor > 0 ? 2 : 0)}%`, background: multiplasSeries ? cores.get(s.id) : "var(--color-primary)" }}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-2">
        {dias.map((dia) => (
          <div key={dia} className="flex-1 text-center text-[10px] text-muted-foreground">
            {dias.length <= 15 ? formatDate(dia).slice(0, 5) : ""}
          </div>
        ))}
      </div>

      {multiplasSeries && (
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
          {comDados.map((s) => (
            <div key={s.id} className="flex items-center gap-1.5">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: cores.get(s.id) }} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
