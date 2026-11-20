import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PrestacaoContasDialog } from "@/components/locacao/prestacao-contas-dialog";
import { SaidaCarrinhoDialog } from "@/components/locacao/saida-carrinho-dialog";
import { DespesaDeleteButton } from "@/components/locacao/despesa-delete-button";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { LocacaoCarrinhoFaturamentoDiario } from "@/types";

interface Diaria {
  data: string;
  descricao: string;
  valor: number;
}

interface Saida {
  id: string;
  data: string;
  descricao: string;
  valor: number;
}

export function FinanceiroCarrinhos({
  linhas,
  diarias,
  saidas,
}: {
  linhas: LocacaoCarrinhoFaturamentoDiario[];
  diarias: Diaria[];
  saidas: Saida[];
}) {
  const porDia = new Map<string, { valorTotal: number; valorPendente: number }>();
  for (const l of linhas) {
    const atual = porDia.get(l.dia) ?? { valorTotal: 0, valorPendente: 0 };
    atual.valorTotal += l.valor_total;
    atual.valorPendente += l.valor_sem_lancamento;
    porDia.set(l.dia, atual);
  }

  const diariasPorDia = new Map<string, Diaria[]>();
  for (const d of diarias) {
    const arr = diariasPorDia.get(d.data) ?? [];
    arr.push(d);
    diariasPorDia.set(d.data, arr);
  }

  const dias = Array.from(porDia.keys()).sort((a, b) => b.localeCompare(a));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-sm font-semibold">Prestação de contas</p>
        {dias.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum aluguel registrado ainda.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {dias.map((dia) => {
              const { valorTotal, valorPendente } = porDia.get(dia)!;
              const diariasDoDia = diariasPorDia.get(dia) ?? [];
              const totalDiarias = diariasDoDia.reduce((acc, d) => acc + d.valor, 0);
              const recebido = valorPendente === 0;

              return (
                <Card key={dia}>
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{formatDate(dia)}</p>
                        <Badge variant={recebido ? "success" : "warning"}>{recebido ? "Recebido" : "Pendente"}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Valor gerado: <span className="font-medium text-foreground">{formatCurrency(valorTotal)}</span>
                        {!recebido && (
                          <>
                            {" "}
                            · pendente:{" "}
                            <span className="font-medium text-foreground">{formatCurrency(valorPendente)}</span>
                          </>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {totalDiarias > 0 ? (
                          <>
                            Diária paga:{" "}
                            <span className="font-medium text-foreground">{formatCurrency(totalDiarias)}</span>
                          </>
                        ) : (
                          "Diária não registrada"
                        )}
                      </p>
                    </div>
                    <PrestacaoContasDialog dia={dia} valorPendente={valorPendente} diariasExistentes={diariasDoDia} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">Saídas</p>
          <SaidaCarrinhoDialog />
        </div>
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-border">
            {saidas.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 p-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{s.descricao}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(s.data)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span className="font-medium text-destructive">{formatCurrency(s.valor)}</span>
                  <DespesaDeleteButton id={s.id} />
                </div>
              </li>
            ))}
            {saidas.length === 0 && (
              <li className="p-4 text-center text-sm text-muted-foreground">Nenhuma saída registrada.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
