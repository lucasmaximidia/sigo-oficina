import { createServiceClient } from "@/lib/supabase/service";
import type { LocacaoStatusPagamento } from "@/types";

type Supabase = ReturnType<typeof createServiceClient>;

// Negócio é diária: se o cliente não devolve no prazo, ele ficou com o
// veículo por mais 1 dia. Em vez de só mostrar "atrasado", lançamos essa
// diária extra no próprio aluguel (valor total sobe; o que já foi pago
// continua registrado, então o status vira "parcial" em vez de voltar a
// "pendente"). A tolerância (padrão 12h, configurável) evita estender por
// um atraso de minutos.
const DIA_MS = 24 * 3_600_000;

async function totalPagoDoAluguel(supabase: Supabase, aluguelId: string) {
  const { data: pagamentos } = await supabase.from("locacao_aluguel_pagamentos").select("valor").eq("aluguel_id", aluguelId);
  return (pagamentos ?? []).reduce((acc, p) => acc + p.valor, 0);
}

// Ponto único de disparo — chamado tanto pelo cron (app/api/cron/notificacoes)
// quanto ao abrir qualquer página do app (app/(app)/layout.tsx), mesmo motivo
// do lib/notificacoes-diarias.ts: o Cron do plano gratuito da Vercel não é
// confiável sozinho. Idempotente por natureza: a extensão empurra a própria
// data_prevista_devolucao pra frente, então rodar de novo logo em seguida (ou
// a partir de duas abas ao mesmo tempo) não soma a mesma diária duas vezes —
// a condição do WHERE otimista abaixo garante isso mesmo com duas chamadas
// concorrentes.
export async function processarExtensaoAlugueisAtrasados() {
  const supabase = createServiceClient();

  const { data: config } = await supabase
    .from("locacao_config")
    .select("extensao_atraso_ativo, extensao_atraso_horas")
    .eq("id", 1)
    .single();
  if (!config?.extensao_atraso_ativo) return;
  const toleranciaMs = config.extensao_atraso_horas * 3_600_000;

  const agora = Date.now();

  const { data: alugueis } = await supabase
    .from("locacao_alugueis")
    .select("id, valor, data_prevista_devolucao, diarias_extras_atraso, locacao_veiculos(valor_diaria)")
    .is("data_devolucao_real", null);

  for (const aluguel of alugueis ?? []) {
    const veiculo = aluguel.locacao_veiculos as unknown as { valor_diaria: number | null } | null;
    const valorDiaria = veiculo?.valor_diaria;
    if (!valorDiaria) continue;

    let novaPrevista = new Date(aluguel.data_prevista_devolucao).getTime();
    let diasAdicionados = 0;
    while (novaPrevista + toleranciaMs <= agora) {
      novaPrevista += DIA_MS;
      diasAdicionados++;
    }
    if (diasAdicionados === 0) continue;

    const novoValor = aluguel.valor + valorDiaria * diasAdicionados;
    const totalPago = await totalPagoDoAluguel(supabase, aluguel.id);
    const statusPagamento: LocacaoStatusPagamento = totalPago >= novoValor - 0.001 ? "pago" : totalPago > 0 ? "parcial" : "pendente";

    await supabase
      .from("locacao_alugueis")
      .update({
        data_prevista_devolucao: new Date(novaPrevista).toISOString(),
        valor: novoValor,
        diarias_extras_atraso: aluguel.diarias_extras_atraso + diasAdicionados,
        status_pagamento: statusPagamento,
        updated_at: new Date().toISOString(),
      })
      .eq("id", aluguel.id)
      .eq("data_prevista_devolucao", aluguel.data_prevista_devolucao);
  }
}
