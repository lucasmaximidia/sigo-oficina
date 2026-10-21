import { Wallet, Clock, AlertTriangle, Bike } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSaldoEmCaixa } from "@/lib/locacao-caixa";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { VeiculosGrid } from "@/components/locacao/veiculos-grid";
import { VeiculoDialog } from "@/components/locacao/veiculo-dialog";
import { formatCurrency } from "@/lib/utils";
import type { AluguelAtivo } from "@/components/locacao/veiculo-card";

export const dynamic = "force-dynamic";

export default async function LocacaoPage() {
  const supabase = await createClient();

  const [{ data: veiculos }, { data: alugueisAbertos }, { data: clientes }, { data: kmFinais }, { data: icones }, saldoCaixa] =
    await Promise.all([
      supabase.from("locacao_veiculos").select("*").order("created_at", { ascending: true }),
      supabase
        .from("locacao_alugueis")
        .select(
          "id, veiculo_id, data_retirada, data_prevista_devolucao, status_pagamento, valor, valor_pago, km_inicio, locacao_clientes(nome)"
        )
        .is("data_devolucao_real", null),
      supabase.from("locacao_clientes").select("id, nome").order("nome", { ascending: true }),
      supabase.from("locacao_alugueis").select("veiculo_id, km_fim").not("km_fim", "is", null),
      supabase.from("locacao_icones").select("*").order("created_at", { ascending: true }),
      getSaldoEmCaixa(supabase),
    ]);

  const kmPorVeiculo: Record<string, number> = {};
  for (const a of kmFinais ?? []) {
    if (a.km_fim != null && (kmPorVeiculo[a.veiculo_id] ?? 0) < a.km_fim) {
      kmPorVeiculo[a.veiculo_id] = a.km_fim;
    }
  }

  const alugueisPorVeiculo: Record<string, AluguelAtivo> = {};
  let aReceber = 0;
  let emAtraso = 0;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  for (const a of alugueisAbertos ?? []) {
    const cliente = a.locacao_clientes as unknown as { nome: string } | null;
    alugueisPorVeiculo[a.veiculo_id] = {
      id: a.id,
      cliente_nome: cliente?.nome ?? "Cliente",
      data_retirada: a.data_retirada,
      data_prevista_devolucao: a.data_prevista_devolucao,
      status_pagamento: a.status_pagamento,
      km_inicio: a.km_inicio,
      valor: a.valor,
    };
    if (a.status_pagamento !== "pago") aReceber += a.valor - a.valor_pago;
    const prevista = new Date(a.data_prevista_devolucao);
    prevista.setHours(0, 0, 0, 0);
    if (prevista.getTime() < hoje.getTime()) emAtraso += 1;
  }

  return (
    <div>
      <PageHeader
        title="Locação"
        description="Scooters e bicicletas elétricas alugadas"
        actions={<VeiculoDialog icones={icones ?? []} />}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Saldo em caixa"
          value={formatCurrency(saldoCaixa.saldo)}
          tone={saldoCaixa.saldo >= 0 ? "success" : "danger"}
        />
        <StatCard icon={Clock} label="A receber" value={formatCurrency(aReceber)} tone="highlight" />
        <StatCard icon={AlertTriangle} label="Em atraso" value={emAtraso} tone={emAtraso > 0 ? "danger" : "default"} />
        <StatCard icon={Bike} label="Aluguéis ativos" value={alugueisAbertos?.length ?? 0} />
      </div>

      <VeiculosGrid
        veiculos={veiculos ?? []}
        alugueisPorVeiculo={alugueisPorVeiculo}
        kmPorVeiculo={kmPorVeiculo}
        clientes={clientes ?? []}
        icones={icones ?? []}
      />
    </div>
  );
}
