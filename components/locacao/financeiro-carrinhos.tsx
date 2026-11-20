import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PrestacaoContasDialog } from "@/components/locacao/prestacao-contas-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { LocacaoCarrinhoFaturamentoDiario } from "@/types";

interface Diaria {
  data: string;
  descricao: string;
  valor: number;
}

export function FinanceiroCarrinhos({
  linhas,
  diarias,
}: {
  linhas: LocacaoCarrinhoFaturamentoDiario[];
  diarias: Diaria[];
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

  if (dias.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum aluguel registrado ainda.</p>;
  }

  return (
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
                      · pendente: <span className="font-medium text-foreground">{formatCurrency(valorPendente)}</span>
                    </>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {totalDiarias > 0 ? (
                    <>
                      Diária paga: <span className="font-medium text-foreground">{formatCurrency(totalDiarias)}</span>
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
  );
}
