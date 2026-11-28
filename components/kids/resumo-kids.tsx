import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { KidsFormaPagamento } from "@/types";

const FORMA_LABEL: Record<KidsFormaPagamento, string> = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  maquininha: "Maquininha",
};

export interface PagamentoResumo {
  id: string;
  tempo_min: number;
  valor: number;
  forma_pagamento: string;
  status: string;
  operador_nome: string | null;
}

export function ResumoKids({ pagamentosHoje }: { pagamentosHoje: PagamentoResumo[] }) {
  const pagos = pagamentosHoje.filter((p) => p.status === "pago");
  const totalGeral = pagos.reduce((soma, p) => soma + p.valor, 0);

  const porForma = new Map<string, { qtd: number; total: number }>();
  for (const p of pagos) {
    const atual = porForma.get(p.forma_pagamento) ?? { qtd: 0, total: 0 };
    porForma.set(p.forma_pagamento, { qtd: atual.qtd + 1, total: atual.total + p.valor });
  }

  const porOperador = new Map<string, { qtd: number; total: number }>();
  for (const p of pagos) {
    const nome = p.operador_nome ?? "(sem nome)";
    const atual = porOperador.get(nome) ?? { qtd: 0, total: 0 };
    porOperador.set(nome, { qtd: atual.qtd + 1, total: atual.total + p.valor });
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Hoje</CardTitle>
          <CardDescription>{pagos.length} pagamento(s) · {formatCurrency(totalGeral)}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-0">
          <div className="flex flex-wrap gap-3">
            {(["pix", "dinheiro", "maquininha"] as KidsFormaPagamento[]).map((forma) => {
              const dado = porForma.get(forma);
              if (!dado) return null;
              return (
                <div key={forma} className="flex min-w-32 flex-col gap-0.5 rounded-lg border border-border p-3">
                  <span className="text-xs text-muted-foreground">{FORMA_LABEL[forma]}</span>
                  <span className="font-display text-lg font-bold">{formatCurrency(dado.total)}</span>
                  <span className="text-xs text-muted-foreground">{dado.qtd}x</span>
                </div>
              );
            })}
            {porForma.size === 0 && <p className="text-sm text-muted-foreground">Nenhum pagamento hoje ainda.</p>}
          </div>

          {porOperador.size > 0 && (
            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <p className="text-sm font-medium">Por operador</p>
              {[...porOperador.entries()].map(([nome, dado]) => (
                <div key={nome} className="flex items-center justify-between text-sm">
                  <span>{nome}</span>
                  <span className="text-muted-foreground">
                    {dado.qtd}x · {formatCurrency(dado.total)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Últimos pagamentos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 pt-0">
          {pagamentosHoje.length === 0 && <p className="text-sm text-muted-foreground">Nenhum pagamento hoje ainda.</p>}
          {pagamentosHoje.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
              <div>
                <p className="font-medium">
                  {p.tempo_min} min · {formatCurrency(p.valor)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {FORMA_LABEL[p.forma_pagamento as KidsFormaPagamento] ?? p.forma_pagamento} · {p.operador_nome ?? "(sem nome)"}
                </p>
              </div>
              <Badge variant={p.status === "pago" ? "success" : "secondary"}>{p.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
