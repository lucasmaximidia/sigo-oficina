import { ArrowDownCircle, ArrowUpCircle, Wallet, ScrollText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSaldoEmCaixa } from "@/lib/locacao-caixa";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DespesaDialog } from "@/components/locacao/despesa-dialog";
import { DespesaDeleteButton } from "@/components/locacao/despesa-delete-button";
import { CaixaConfigDialog } from "@/components/locacao/caixa-config-dialog";
import { AjusteCaixaDialog } from "@/components/locacao/ajuste-caixa-dialog";
import { AjusteCaixaDeleteButton } from "@/components/locacao/ajuste-caixa-delete-button";
import { OutraEntradaDialog } from "@/components/locacao/outra-entrada-dialog";
import { OutraEntradaDeleteButton } from "@/components/locacao/outra-entrada-delete-button";
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

  const [
    { data: alugueisPagosMes },
    { data: despesas },
    { data: veiculos },
    saldoCaixa,
    { data: ajustes },
    { data: outrasEntradas },
  ] = await Promise.all([
    supabase.from("locacao_alugueis").select("valor_pago").eq("status_pagamento", "pago").gte("data_pagamento", inicioMes),
    supabase
      .from("locacao_despesas")
      .select("*, locacao_veiculos(marca, modelo)")
      .order("data", { ascending: false }),
    supabase.from("locacao_veiculos").select("id, marca, modelo").order("marca", { ascending: true }),
    getSaldoEmCaixa(supabase),
    supabase.from("locacao_ajustes_caixa").select("*").order("data", { ascending: false }),
    supabase.from("locacao_outras_entradas").select("*").order("data", { ascending: false }),
  ]);

  const outrasEntradasMes = (outrasEntradas ?? []).filter((e) => e.data >= inicioMes).reduce((acc, r) => acc + r.valor, 0);
  const entradasMes = (alugueisPagosMes ?? []).reduce((acc, r) => acc + (r.valor_pago ?? 0), 0) + outrasEntradasMes;
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

      <Card className="mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between md:p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Saldo em caixa</p>
          <p className={`font-display text-3xl font-bold ${saldoCaixa.saldo >= 0 ? "text-success" : "text-destructive"}`}>
            {formatCurrency(saldoCaixa.saldo)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {saldoCaixa.dataInicio
              ? `Saldo inicial de ${formatCurrency(saldoCaixa.saldoInicial)} em ${formatDate(saldoCaixa.dataInicio)}, mais movimentação desde então.`
              : "Nenhuma data de início configurada — somando toda a movimentação já lançada."}
          </p>
        </div>
        <CaixaConfigDialog saldoInicial={saldoCaixa.saldoInicial} dataInicio={saldoCaixa.dataInicio} />
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon={ArrowUpCircle} label="Entradas no mês" value={formatCurrency(entradasMes)} tone="success" />
        <StatCard icon={ArrowDownCircle} label="Saídas no mês" value={formatCurrency(saidasMes)} tone="danger" />
        <StatCard icon={Wallet} label="Saldo do mês" value={formatCurrency(saldoMes)} tone={saldoMes >= 0 ? "highlight" : "danger"} />
      </div>

      <Card className="mb-6 p-0">
        <div className="flex items-center justify-between border-b border-border p-4">
          <p className="text-sm font-semibold text-foreground">Ajustes de caixa</p>
          <AjusteCaixaDialog />
        </div>
        <div className="flex flex-col divide-y divide-border">
          {(ajustes ?? []).map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{a.motivo}</p>
                <p className="text-xs text-muted-foreground">{formatDate(a.data)}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold ${a.valor >= 0 ? "text-success" : "text-destructive"}`}>
                  {a.valor >= 0 ? "+" : ""}
                  {formatCurrency(a.valor)}
                </p>
                <AjusteCaixaDeleteButton id={a.id} />
              </div>
            </div>
          ))}
        </div>
        {(ajustes ?? []).length === 0 && (
          <EmptyState icon={<ScrollText className="size-5" />} title="Nenhum ajuste registrado" className="py-6" />
        )}
      </Card>

      <Card className="mb-6 p-0">
        <div className="flex items-center justify-between border-b border-border p-4">
          <p className="text-sm font-semibold text-foreground">Outras entradas</p>
          <OutraEntradaDialog />
        </div>
        <div className="flex flex-col divide-y divide-border">
          {(outrasEntradas ?? []).map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{e.descricao}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(e.data)}
                  {e.categoria ? ` · ${e.categoria}` : ""}
                  {e.forma_pagamento ? ` · ${FORMA_LABEL[e.forma_pagamento] ?? e.forma_pagamento}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-success">+{formatCurrency(e.valor)}</p>
                <OutraEntradaDeleteButton id={e.id} />
              </div>
            </div>
          ))}
        </div>
        {(outrasEntradas ?? []).length === 0 && (
          <EmptyState icon={<ArrowUpCircle className="size-5" />} title="Nenhuma outra entrada registrada" className="py-6" />
        )}
      </Card>

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
