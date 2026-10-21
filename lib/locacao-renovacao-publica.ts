"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { enviarPushParaTodos } from "@/lib/push";

// Aceite da renovação pela página pública (sem login) — chamado direto do
// formulário em /locacao/renovar/[token]. A validação de verdade (link
// existe, ainda não expirou, ainda não foi aceito) acontece dentro da
// função do banco (aceitar_renovacao_locacao), que nunca lança excessão —
// aqui só decidimos se avisamos a oficina e sempre recarregamos a página
// pra mostrar o estado real.
export async function aceitarRenovacaoPublica(token: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("aceitar_renovacao_locacao", { p_token: token }).maybeSingle();

  if (data?.sucesso && data.mensagem === "Renovação confirmada") {
    const { data: renovacao } = await supabase.rpc("obter_renovacao_locacao", { p_token: token }).maybeSingle();
    if (renovacao) {
      const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "America/Sao_Paulo",
      }).format(new Date(renovacao.nova_data_devolucao));
      await enviarPushParaTodos({
        title: "Renovação de aluguel aceita",
        body: `${renovacao.cliente_nome} renovou o aluguel #${String(renovacao.numero).padStart(4, "0")} até ${dataFormatada}.`,
        url: "/locacao/alugueis",
      });
    }
  }

  redirect(`/locacao/renovar/${token}`);
}
