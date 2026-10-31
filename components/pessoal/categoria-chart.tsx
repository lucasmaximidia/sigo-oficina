import { formatCurrency } from "@/lib/utils";
import { PESSOAL_CARTAO_CATEGORIA_LABEL } from "@/lib/pessoal-status";
import type { PessoalCartaoCategoria } from "@/types";

// 8 matizes categóricos validados (ver app/globals.css --chart-1..8) — nunca
// ciclados; a 9ª categoria em diante dobra pra "Outras" (cinza neutro), em
// vez de inventar uma cor nova. Ver skill de dataviz.
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

export function CategoriaChart({ dados }: { dados: { categoria: PessoalCartaoCategoria; valor: number }[] }) {
  const comValor = dados.filter((d) => d.valor > 0).sort((a, b) => b.valor - a.valor);
  const total = comValor.reduce((acc, d) => acc + d.valor, 0);

  const principais = comValor.slice(0, 8).map((d, i) => ({ ...d, cor: CORES_ORDENADAS[i] }));
  const restante = comValor.slice(8);
  const valorOutros = restante.reduce((acc, d) => acc + d.valor, 0);
  const fatias = valorOutros > 0 ? [...principais, { categoria: null, valor: valorOutros, cor: COR_OUTROS }] : principais;

  if (total === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum gasto de cartão classificado neste mês ainda.</p>;
  }

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex h-3.5 w-full overflow-hidden rounded-full">
        {fatias.map((f, i) => (
          <div
            key={f.categoria ?? "outros"}
            style={{ width: `${(f.valor / total) * 100}%`, background: f.cor }}
            className={i > 0 ? "ml-0.5" : undefined}
          />
        ))}
      </div>
      <div className="flex flex-col gap-2.5">
        {fatias.map((f) => (
          <div key={f.categoria ?? "outros"} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: f.cor }} />
            <span className="flex-1 text-sm font-medium text-foreground">
              {f.categoria ? PESSOAL_CARTAO_CATEGORIA_LABEL[f.categoria] : `Outras (${restante.length})`}
            </span>
            <span className="text-sm font-bold text-foreground">{Math.round((f.valor / total) * 100)}%</span>
            <span className="w-24 text-right text-xs text-muted-foreground">{formatCurrency(f.valor)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
