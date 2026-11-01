import { HandCoins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarcarRepasseRecebidoButton } from "@/components/pessoal/marcar-repasse-recebido-button";
import { CATEGORIAS_A_RECEBER, PESSOAL_CARTAO_CATEGORIA_LABEL } from "@/lib/pessoal-status";
import { formatCurrency } from "@/lib/utils";
import type { PessoalCartaoLancamento } from "@/types";

// Gastos feitos no cartão pessoal por conta da oficina/VoltCity/empréstimos
// a terceiros — dinheiro que deve ser repassado de volta. Só conta o que já
// foi confirmado (valor_real), pra não contar fatura que ainda pode mudar.
export function ARecemberSection({ lancamentos, mes }: { lancamentos: PessoalCartaoLancamento[]; mes: string }) {
  const porCategoria = CATEGORIAS_A_RECEBER.map((categoria) => {
    const itens = lancamentos.filter((l) => l.categoria === categoria && l.valor_real != null);
    return {
      categoria,
      itens,
      valor: itens.reduce((acc, l) => acc + (l.valor_real ?? 0), 0),
    };
  }).filter((c) => c.valor !== 0);

  const total = porCategoria.reduce((acc, c) => acc + c.valor, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HandCoins className="size-4.5 text-primary" />
          A receber de terceiros
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Gastos confirmados no cartão por conta de Oficina, VoltCity e empréstimos a terceiros neste mês.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum gasto confirmado dessas categorias neste mês ainda.</p>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {porCategoria.map((c) => (
                <div key={c.categoria} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{PESSOAL_CARTAO_CATEGORIA_LABEL[c.categoria]}</span>
                    <span className="font-medium text-foreground">{formatCurrency(c.valor)}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {c.itens.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span className="truncate">{item.descricao}</span>
                        <span className="shrink-0">{formatCurrency(item.valor_real ?? 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2.5">
              <span className="text-sm font-semibold text-foreground">Total a receber</span>
              <span className="text-lg font-bold text-success">{formatCurrency(total)}</span>
            </div>
            <MarcarRepasseRecebidoButton mes={mes} valor={total} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
