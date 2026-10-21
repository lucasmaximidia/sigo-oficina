import type { createClient } from "@/lib/supabase/server";
import { agoraBR, dataBR } from "@/lib/utils";

// Para colunas "date" puras (sem horário) — fatiar a string é seguro.
function mesKey(dataStr: string) {
  return dataStr.slice(0, 7);
}

function proximoMes(mes: string) {
  const [y, m] = mes.split("-").map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Quantos dias do aluguel (retirada inclusa, devolução não — mesma regra da
// planilha original) caem em cada mês civil. `inicio`/`fim` são datas puras
// (YYYY-MM-DD) já convertidas pro fuso do Brasil.
function diasPorMesNoIntervalo(inicio: string, fim: string): Map<string, number> {
  const porMes = new Map<string, number>();
  let atual = new Date(`${inicio}T00:00:00Z`);
  const fimData = new Date(`${fim}T00:00:00Z`);
  while (atual < fimData) {
    const mes = `${atual.getUTCFullYear()}-${String(atual.getUTCMonth() + 1).padStart(2, "0")}`;
    porMes.set(mes, (porMes.get(mes) ?? 0) + 1);
    atual = new Date(atual.getTime() + 86_400_000);
  }
  return porMes;
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
  const [{ data: alugueis }, { data: pagamentosAluguel }, { data: despesas }, { data: ajustes }, { data: outrasEntradas }, { data: config }] =
    await Promise.all([
      supabase.from("locacao_alugueis").select("data_retirada, data_prevista_devolucao, data_devolucao_real, valor, valor_pago"),
      supabase.from("locacao_aluguel_pagamentos").select("data, valor"),
      supabase.from("locacao_despesas").select("data, valor"),
      supabase.from("locacao_ajustes_caixa").select("data, valor"),
      supabase.from("locacao_outras_entradas").select("data, valor"),
      supabase.from("locacao_config").select("saldo_inicial, data_inicio_caixa").eq("id", 1).single(),
    ]);

  const saldoInicial = config?.saldo_inicial ?? 0;
  const dataInicio = config?.data_inicio_caixa ?? null;

  // Rateio por dia (igual à aba RESUMO da planilha original): o valor do
  // aluguel é dividido por dia e cada mês recebe só os dias que caem nele —
  // em vez de jogar o valor inteiro no mês da retirada. Isso importa pra
  // aluguéis longos que atravessam a virada do mês.
  const resumoPorMes = new Map<string, ResumoMensalAluguel>();
  for (const a of alugueis ?? []) {
    const inicio = dataBR(a.data_retirada);
    const fim = dataBR(a.data_devolucao_real ?? a.data_prevista_devolucao);
    const diasPorMes = diasPorMesNoIntervalo(inicio, fim);
    const totalDias = [...diasPorMes.values()].reduce((soma, n) => soma + n, 0) || 1;
    const valorPorDia = a.valor / totalDias;
    const pagoPorDia = a.valor_pago / totalDias;
    for (const [mes, dias] of diasPorMes) {
      const atual = resumoPorMes.get(mes) ?? { mes, numeroAlugueis: 0, total: 0, recebido: 0, aReceber: 0 };
      atual.numeroAlugueis += 1;
      const valorMes = valorPorDia * dias;
      const pagoMes = pagoPorDia * dias;
      atual.total += valorMes;
      atual.recebido += pagoMes;
      atual.aReceber += valorMes - pagoMes;
      resumoPorMes.set(mes, atual);
    }
  }

  const alugueisRecebidosPorMes = new Map<string, number>();
  for (const p of pagamentosAluguel ?? []) {
    const mes = mesKey(p.data);
    alugueisRecebidosPorMes.set(mes, (alugueisRecebidosPorMes.get(mes) ?? 0) + p.valor);
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
