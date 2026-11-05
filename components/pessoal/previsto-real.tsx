import { formatCurrency } from "@/lib/utils";

// Resumo "Previsto · Real" do cabeçalho de cada card do Financeiro Pessoal —
// antes era uma linha de texto cinza inteira, difícil de escanear qual
// número era qual. Agora cada valor vem em negrito e o Real ganha a cor de
// sucesso quando já tem algo confirmado, pra pular aos olhos.
export function PrevistoReal({ previsto, real }: { previsto: number; real: number }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
      <span>
        Previsto <strong className="font-semibold text-foreground">{formatCurrency(previsto)}</strong>
      </span>
      <span className="text-border">·</span>
      <span>
        Real{" "}
        <strong className={real > 0 ? "font-semibold text-success" : "font-semibold text-foreground"}>
          {formatCurrency(real)}
        </strong>
      </span>
    </div>
  );
}
