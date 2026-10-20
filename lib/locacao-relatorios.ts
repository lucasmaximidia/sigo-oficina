import type { createClient } from "@/lib/supabase/server";
import { agoraBR, dataBR } from "@/lib/utils";

// Para colunas "date" puras (sem horário) — fatiar a string é seguro.
function mesKey(dataStr: string) {
  return dataStr.slice(0, 7);
}

// Para colunas timestamptz (ex.: data_retirada) — nunca fatiar direto: o
// valor vem em UTC, que diverge do mês civil do Brasil perto da virada do
// mês entre ~21h e meia-noite (horário de Brasília).
function mesKeyTimestamp(dataStr: string) {
  return dataBR(dataStr).slice(0, 7);
}

function proximoMes(mes: string) {
  const [y, m] = mes.split("-").map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export interface ResumoMensalAluguel {
  mes: string;
  numeroAlugueis: number;
  total: number;
  recebido: number;
  aReceber: number;
}

export interface FluxoCaixaMensal {
  mes: string;
  alugueisRecebidos: number;
  outrasEntradas: number;
  totalEntradas: number;
  saidas: number;
  ajustesLiquido: number;
  resultado: number;
  saldoFim: number;
}

// Dois relatórios mensais espelhando as abas "RESUMO" (por competência — mês
// da retirada) e "FLUXO DE CAIXA" (regime de caixa — mês em que o dinheiro
// realmente entrou/saiu) da planilha de controle de caixa original.
export async function getRelatoriosLocacao(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [{ data: alugueis }, { data: despesas }, { data: ajustes }, { data: outrasEntradas }, { data: config }] =
    await Promise.all([
      supabase.from("locacao_alugueis").select("data_retirada, data_pagamento, valor, valor_pago, status_pagamento"),
      supabase.from("locacao_despesas").select("data, valor"),
      supabase.from("locacao_ajustes_caixa").select("data, valor"),
      supabase.from("locacao_outras_entradas").select("data, valor"),
      supabase.from("locacao_config").select("saldo_inicial, data_inicio_caixa").eq("id", 1).single(),
    ]);

  const saldoInicial = config?.saldo_inicial ?? 0;
  const dataInicio = config?.data_inicio_caixa ?? null;

  const resumoPorMes = new Map<string, ResumoMensalAluguel>();
  for (const a of alugueis ?? []) {
    const mes = mesKeyTimestamp(a.data_retirada);
    const atual = resumoPorMes.get(mes) ?? { mes, numeroAlugueis: 0, total: 0, recebido: 0, aReceber: 0 };
    atual.numeroAlugueis += 1;
    atual.total += a.valor;
    atual.recebido += a.valor_pago;
    atual.aReceber += a.valor - a.valor_pago;
    resumoPorMes.set(mes, atual);
  }

  const alugueisRecebidosPorMes = new Map<string, number>();
  for (const a of alugueis ?? []) {
    if (a.status_pagamento === "pago" && a.data_pagamento) {
      const mes = mesKey(a.data_pagamento);
      alugueisRecebidosPorMes.set(mes, (alugueisRecebidosPorMes.get(mes) ?? 0) + a.valor_pago);
    }
  }
  const outrasEntradasPorMes = new Map<string, number>();
  for (const e of outrasEntradas ?? []) {
    const mes = mesKey(e.data);
    outrasEntradasPorMes.set(mes, (outrasEntradasPorMes.get(mes) ?? 0) + e.valor);
  }
  const saidasPorMes = new Map<string, number>();
  for (const d of despesas ?? []) {
    const mes = mesKey(d.data);
    saidasPorMes.set(mes, (saidasPorMes.get(mes) ?? 0) + d.valor);
  }
  const ajustesPorMes = new Map<string, number>();
  for (const aj of ajustes ?? []) {
    const mes = mesKey(aj.data);
    ajustesPorMes.set(mes, (ajustesPorMes.get(mes) ?? 0) + aj.valor);
  }

  const todosMeses = new Set<string>([
    ...resumoPorMes.keys(),
    ...alugueisRecebidosPorMes.keys(),
    ...outrasEntradasPorMes.keys(),
    ...saidasPorMes.keys(),
    ...ajustesPorMes.keys(),
  ]);
  if (dataInicio) todosMeses.add(mesKey(dataInicio));
  const { ano: anoAtual, mes: mesAtual } = agoraBR();
  todosMeses.add(`${anoAtual}-${String(mesAtual).padStart(2, "0")}`);

  let mesesOrdenados = [...todosMeses].sort();
  if (mesesOrdenados.length > 0) {
    const preenchidos: string[] = [];
    let atual = mesesOrdenados[0];
    const ultimo = mesesOrdenados[mesesOrdenados.length - 1];
    while (atual <= ultimo) {
      preenchidos.push(atual);
      atual = proximoMes(atual);
    }
    mesesOrdenados = preenchidos;
  }

  let saldoAcumulado = saldoInicial;
  const fluxoCaixa: FluxoCaixaMensal[] = mesesOrdenados
    .filter((mes) => !dataInicio || mes >= mesKey(dataInicio))
    .map((mes) => {
      const alugueisRecebidos = alugueisRecebidosPorMes.get(mes) ?? 0;
      const outras = outrasEntradasPorMes.get(mes) ?? 0;
      const totalEntradas = alugueisRecebidos + outras;
      const saidas = saidasPorMes.get(mes) ?? 0;
      const ajustesLiquido = ajustesPorMes.get(mes) ?? 0;
      const resultado = totalEntradas - saidas + ajustesLiquido;
      saldoAcumulado += resultado;
      return {
        mes,
        alugueisRecebidos,
        outrasEntradas: outras,
        totalEntradas,
        saidas,
        ajustesLiquido,
        resultado,
        saldoFim: saldoAcumulado,
      };
    });

  const resumoMensal = [...resumoPorMes.values()].sort((a, b) => b.mes.localeCompare(a.mes));

  return { resumoMensal, fluxoCaixa: fluxoCaixa.reverse() };
}
