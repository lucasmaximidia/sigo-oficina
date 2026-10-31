import { CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FecharFaturaCartaoButton } from "@/components/financeiro/fechar-fatura-cartao-button";
import { formatCurrency } from "@/lib/utils";
import type { MesDespesaCartaoPendente } from "@/types";

const MESES_LABEL = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function labelMes(mes: string) {
  const [ano, mesNum] = mes.split("-").map(Number);
  return `${MESES_LABEL[mesNum - 1]} de ${ano}`;
}

export function AcertoCartao({ meses }: { meses: MesDespesaCartaoPendente[] }) {
  if (meses.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-4.5 text-primary" />
          Fatura do Cartão
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Gastos no cartão ainda não repassados — o valor só sai do caixa quando a fatura é fechada.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {meses.map((grupo) => (
          <div key={grupo.mes} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{labelMes(grupo.mes)}</p>
                <p className="text-xs text-muted-foreground">
                  {grupo.itens.length} {grupo.itens.length === 1 ? "gasto" : "gastos"}, aguardando fatura
                </p>
              </div>
              <FecharFaturaCartaoButton despesaIds={grupo.itens.map((item) => item.id)} total={grupo.total} />
            </div>
            {grupo.itens.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 rounded-lg border border-border p-3 text-sm"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate text-foreground">
                    {item.descricao}
                    {item.categoria && <span className="text-muted-foreground"> · {item.categoria}</span>}
                  </span>
                </div>
                <span className="shrink-0 font-medium text-foreground">{formatCurrency(item.valor)}</span>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
