import type { createClient } from "@/lib/supabase/server";

// Saldo em caixa "de verdade" (cumulativo), não só o saldo do mês: parte de
// um saldo inicial numa data de início (configurados em locacao_config) e
// soma tudo que entrou/saiu a partir dali, mais ajustes manuais — mesmo
// modelo da planilha de controle de caixa original.
export async function getSaldoEmCaixa(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: config } = await supabase
    .from("locacao_config")
    .select("saldo_inicial, data_inicio_caixa")
    .eq("id", 1)
    .single();

  const saldoInicial = config?.saldo_inicial ?? 0;
  const dataInicio = config?.data_inicio_caixa ?? null;

  let pagosQuery = supabase.from("locacao_alugueis").select("valor_pago").eq("status_pagamento", "pago");
  let despesasQuery = supabase.from("locacao_despesas").select("valor");
  let ajustesQuery = supabase.from("locacao_ajustes_caixa").select("valor");
  if (dataInicio) {
    pagosQuery = pagosQuery.gte("data_pagamento", dataInicio);
    despesasQuery = despesasQuery.gte("data", dataInicio);
    ajustesQuery = ajustesQuery.gte("data", dataInicio);
  }

  const [{ data: pagos }, { data: despesas }, { data: ajustes }] = await Promise.all([
    pagosQuery,
    despesasQuery,
    ajustesQuery,
  ]);

  const entradas = (pagos ?? []).reduce((acc, r) => acc + (r.valor_pago ?? 0), 0);
  const saidas = (despesas ?? []).reduce((acc, r) => acc + r.valor, 0);
  const ajustesTotal = (ajustes ?? []).reduce((acc, r) => acc + r.valor, 0);

  return {
    saldo: saldoInicial + entradas - saidas + ajustesTotal,
    saldoInicial,
    dataInicio,
    entradas,
    saidas,
    ajustesTotal,
  };
}
