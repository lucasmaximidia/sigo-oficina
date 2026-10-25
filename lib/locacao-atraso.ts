import { createServiceClient } from "@/lib/supabase/service";

// Ponto único de disparo — chamado tanto pelo cron (app/api/cron/notificacoes)
// quanto ao abrir qualquer página do app (app/(app)/layout.tsx), mesmo motivo
// do lib/notificacoes-diarias.ts: o Cron do plano gratuito da Vercel não é
// confiável sozinho. A decisão de "atrasou mais que a tolerância configurada"
// e a extensão em si acontecem inteiramente dentro da função
// processar_extensao_alugueis_atrasados() no Postgres (ver migration 0057) —
// comparar o relógio do processo Node (Vercel) contra data_prevista_devolucao
// já causou uma extensão prematura (diária cobrada ~35min antes da tolerância
// vencer, sem conseguirmos provar a causa exata sem logs de execução); mover
// a decisão pro banco, usando now() do próprio Postgres como única fonte de
// verdade, elimina esse desvio de relógio como causa possível.
export async function processarExtensaoAlugueisAtrasados() {
  const supabase = createServiceClient();
  await supabase.rpc("processar_extensao_alugueis_atrasados");
}
