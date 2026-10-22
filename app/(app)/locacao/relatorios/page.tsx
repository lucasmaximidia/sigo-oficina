import { createClient } from "@/lib/supabase/server";
import { getRelatoriosLocacao } from "@/lib/locacao-relatorios";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

function labelMes(mes: string) {
  const [ano, mesNum] = mes.split("-").map(Number);
  const label = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" })
    .format(new Date(ano, mesNum - 1, 1))
    .replace(".", "");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default async function LocacaoRelatoriosPage() {
  const supabase = await createClient();
  const { resumoMensal, fluxoCaixa } = await getRelatoriosLocacao(supabase);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Relatórios" description="Resumo mensal dos aluguéis e fluxo de caixa" />

      <Card className="p-0">
        <div className="border-b border-border p-4">
          <p className="text-sm font-semibold text-foreground">Resumo mensal dos aluguéis</p>
          <p className="text-xs text-muted-foreground">
            Por competência — aluguéis que atravessam a virada do mês têm o valor dividido por dia entre os meses.
          </p>
        </div>
        <div className="divide-y divide-border md:hidden">
          {resumoMensal.map((r) => (
            <div key={r.mes} className="flex flex-col gap-2 p-4">
              <p className="text-sm font-semibold text-foreground">{labelMes(r.mes)}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Aluguéis</p>
                  <p className="font-medium text-foreground">{r.numeroAlugueis}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-medium text-foreground">{formatCurrency(r.total)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Recebido</p>
                  <p className="font-medium text-success">{formatCurrency(r.recebido)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">A receber</p>
                  <p className="font-medium text-warning">{formatCurrency(r.aReceber)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="px-4 py-2.5 text-left font-medium">Mês</th>
                <th className="px-4 py-2.5 text-right font-medium">Aluguéis</th>
                <th className="px-4 py-2.5 text-right font-medium">Total</th>
                <th className="px-4 py-2.5 text-right font-medium">Recebido</th>
                <th className="px-4 py-2.5 text-right font-medium">A receber</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {resumoMensal.map((r) => (
                <tr key={r.mes}>
                  <td className="px-4 py-2.5 font-medium text-foreground">{labelMes(r.mes)}</td>
                  <td className="px-4 py-2.5 text-right text-foreground">{r.numeroAlugueis}</td>
                  <td className="px-4 py-2.5 text-right text-foreground">{formatCurrency(r.total)}</td>
                  <td className="px-4 py-2.5 text-right text-success">{formatCurrency(r.recebido)}</td>
                  <td className="px-4 py-2.5 text-right text-warning">{formatCurrency(r.aReceber)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {resumoMensal.length === 0 && (
          <EmptyState icon={<BarChart3 className="size-5" />} title="Nenhum aluguel registrado ainda" className="py-6" />
        )}
      </Card>

      <Card className="p-0">
        <div className="border-b border-border p-4">
          <p className="text-sm font-semibold text-foreground">Fluxo de caixa mês a mês</p>
          <p className="text-xs text-muted-foreground">
            Regime de caixa — dinheiro que realmente entrou e saiu em cada mês, a partir da data de início do caixa.
          </p>
        </div>
        <div className="divide-y divide-border md:hidden">
          {fluxoCaixa.map((f) => (
            <div key={f.mes} className="flex flex-col gap-2 p-4">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-semibold text-foreground">{labelMes(f.mes)}</p>
                <p className="text-sm font-semibold text-foreground">{formatCurrency(f.saldoFim)}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Aluguéis</p>
                  <p className="font-medium text-foreground">{formatCurrency(f.alugueisRecebidos)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Outras entradas</p>
                  <p className="font-medium text-foreground">{formatCurrency(f.outrasEntradas)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Saídas</p>
                  <p className="font-medium text-destructive">-{formatCurrency(f.saidas)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ajustes</p>
                  <p className={`font-medium ${f.ajustesLiquido >= 0 ? "text-success" : "text-destructive"}`}>
                    {f.ajustesLiquido >= 0 ? "+" : ""}
                    {formatCurrency(f.ajustesLiquido)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Resultado</p>
                  <p className={`font-medium ${f.resultado >= 0 ? "text-success" : "text-destructive"}`}>
                    {f.resultado >= 0 ? "+" : ""}
                    {formatCurrency(f.resultado)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="px-4 py-2.5 text-left font-medium">Mês</th>
                <th className="px-4 py-2.5 text-right font-medium">Aluguéis</th>
                <th className="px-4 py-2.5 text-right font-medium">Outras entradas</th>
                <th className="px-4 py-2.5 text-right font-medium">Saídas</th>
                <th className="px-4 py-2.5 text-right font-medium">Ajustes</th>
                <th className="px-4 py-2.5 text-right font-medium">Resultado</th>
                <th className="px-4 py-2.5 text-right font-medium">Saldo no fim do mês</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {fluxoCaixa.map((f) => (
                <tr key={f.mes}>
                  <td className="px-4 py-2.5 font-medium text-foreground">{labelMes(f.mes)}</td>
                  <td className="px-4 py-2.5 text-right text-foreground">{formatCurrency(f.alugueisRecebidos)}</td>
                  <td className="px-4 py-2.5 text-right text-foreground">{formatCurrency(f.outrasEntradas)}</td>
                  <td className="px-4 py-2.5 text-right text-destructive">-{formatCurrency(f.saidas)}</td>
                  <td className={`px-4 py-2.5 text-right ${f.ajustesLiquido >= 0 ? "text-success" : "text-destructive"}`}>
                    {f.ajustesLiquido >= 0 ? "+" : ""}
                    {formatCurrency(f.ajustesLiquido)}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right font-medium ${f.resultado >= 0 ? "text-success" : "text-destructive"}`}
                  >
                    {f.resultado >= 0 ? "+" : ""}
                    {formatCurrency(f.resultado)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-foreground">{formatCurrency(f.saldoFim)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {fluxoCaixa.length === 0 && (
          <EmptyState icon={<BarChart3 className="size-5" />} title="Nenhuma movimentação registrada ainda" className="py-6" />
        )}
      </Card>
    </div>
  );
}
