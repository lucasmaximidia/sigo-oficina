import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DespesaDialog } from "@/components/locacao/despesa-dialog";
import { DespesaDeleteButton } from "@/components/locacao/despesa-delete-button";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const FORMA_LABEL: Record<string, string> = {
  pix: "PIX",
  cartao: "Cartão",
  dinheiro: "Dinheiro",
  transferencia: "Transferência",
};

export default async function LocacaoFinanceiroPage() {
  const supabase = await createClient();
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

  const [{ data: alugueisPagosMes }, { data: despesas }, { data: veiculos }] = await Promise.all([
    supabase.from("locacao_alugueis").select("valor_pago").eq("status_pagamento", "pago").gte("data_pagamento", inicioMes),
    supabase
      .from("locacao_despesas")
      .select("*, locacao_veiculos(marca, modelo)")
      .order("data", { ascending: false }),
    supabase.from("locacao_veiculos").select("id, marca, modelo").order("marca", { ascending: true }),
  ]);

  const entradasMes = (alugueisPagosMes ?? []).reduce((acc, r) => acc + (r.valor_pago ?? 0), 0);
  const despesasMes = (despesas ?? []).filter((d) => d.data >= inicioMes);
  const saidasMes = despesasMes.reduce((acc, r) => acc + r.valor, 0);
  const saldoMes = entradasMes - saidasMes;

  return (
    <div>
      <PageHeader
        title="Financeiro da Locação"
        description="Entradas dos aluguéis e saídas do mês"
        actions={<DespesaDialog veiculos={veiculos ?? []} />}
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon={ArrowUpCircle} label="Entradas no mês" value={formatCurrency(entradasMes)} tone="success" />
        <StatCard icon={ArrowDownCircle} label="Saídas no mês" value={formatCurrency(saidasMes)} tone="danger" />
        <StatCard icon={Wallet} label="Saldo do mês" value={formatCurrency(saldoMes)} tone={saldoMes >= 0 ? "highlight" : "danger"} />
      </div>

      <Card className="p-0">
        <div className="border-b border-border p-4">
          <p className="text-sm font-semibold text-foreground">Saídas registradas</p>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {(despesas ?? []).map((d) => {
            const veiculo = d.locacao_veiculos as unknown as { marca: string; modelo: string } | null;
            return (
              <div key={d.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{d.descricao}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(d.data)}
                    {d.categoria ? ` · ${d.categoria}` : ""}
                    {d.fornecedor ? ` · ${d.fornecedor}` : ""}
                    {d.forma_pagamento ? ` · ${FORMA_LABEL[d.forma_pagamento] ?? d.forma_pagamento}` : ""}
                    {veiculo ? ` · ${veiculo.marca} ${veiculo.modelo}` : ""}
                    {d.km != null ? ` · ${d.km} km` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-destructive">-{formatCurrency(d.valor)}</p>
                  <DespesaDeleteButton id={d.id} />
                </div>
              </div>
            );
          })}
        </div>
        {(despesas ?? []).length === 0 && (
          <EmptyState icon={<ArrowDownCircle className="size-5" />} title="Nenhuma saída registrada ainda" />
        )}
      </Card>
    </div>
  );
}
