import { formatCurrency } from "@/lib/utils";

const CORES: Record<string, string> = {
  pix: "var(--color-primary)",
  cartao: "var(--color-info)",
  dinheiro: "var(--color-warning)",
};

const LABELS: Record<string, string> = {
  pix: "Pix",
  cartao: "Cartão",
  dinheiro: "Dinheiro",
};

export function FormasPagamentoCard({ dados }: { dados: { forma: string; valor: number }[] }) {
  const total = dados.reduce((acc, d) => acc + d.valor, 0);
  const ordenado = [...dados].sort((a, b) => b.valor - a.valor);

  return (
    <div className="flex flex-col">
      {total > 0 ? (
        <div className="mb-4 flex h-3.5 w-full overflow-hidden rounded-full">
          {ordenado.map((d) => (
            <div key={d.forma} style={{ width: `${(d.valor / total) * 100}%`, background: CORES[d.forma] ?? "var(--color-muted-foreground)" }} />
          ))}
        </div>
      ) : (
        <div className="mb-4 h-3.5 w-full rounded-full bg-secondary" />
      )}

      <div className="flex flex-col gap-3">
        {ordenado.map((d) => (
          <div key={d.forma} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: CORES[d.forma] ?? "var(--color-muted-foreground)" }} />
            <span className="flex-1 text-sm font-medium text-foreground">{LABELS[d.forma] ?? d.forma}</span>
            <span className="text-sm font-bold text-foreground">
              {total > 0 ? Math.round((d.valor / total) * 100) : 0}%
            </span>
            <span className="w-24 text-right text-xs text-muted-foreground">{formatCurrency(d.valor)}</span>
          </div>
        ))}
        {total === 0 && <p className="text-sm text-muted-foreground">Nenhuma entrada este mês ainda.</p>}
      </div>
    </div>
  );
}
