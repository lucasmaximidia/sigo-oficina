import { createServiceClient } from "@/lib/supabase/service";

// Ponto único de disparo — chamado tanto pelo cron (app/api/cron/notificacoes)
// quanto ao abrir qualquer página do app (app/(app)/layout.tsx), mesmo motivo
// do lib/notificacoes-diarias.ts: o Cron do plano gratuito da Vercel não é
// confiável sozinho. A decisão de "atrasou mais que a tolerância configurada"
// e a extensão em si acontecem inteiramente dentro da função
// processar_extensao_alugueis_atrasados() no Postgres (ver migration 0057,
// que move a comparação de horário pro banco — comparar o relógio do
// processo Node contra data_prevista_devolucao já causou uma extensão
// prematura — e 0058, que passou a encerrar o aluguel atrasado na data
// combinada original e abrir um novo cobrindo só o período em atraso, em vez
// de inflar o mesmo registro com uma data empurrada e um contador que só
// cresce — isso deixava a tela mostrando "em dia" e "atrasado" ao mesmo
// tempo).
export async function processarExtensaoAlugueisAtrasados() {
  const supabase = createServiceClient();
  await supabase.rpc("processar_extensao_alugueis_atrasados");
}
