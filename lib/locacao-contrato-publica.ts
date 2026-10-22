"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { enviarPushParaTodos } from "@/lib/push";

// Aceite do contrato (contratação, não só renovação) pela página pública
// (sem login) — chamado direto do formulário em /locacao/contrato/[id]. A
// validação de verdade (aluguel existe, nome não vazio, ainda não aceito)
// acontece dentro da função do banco (aceitar_contrato_locacao), que nunca
// lança excessão — aqui só decidimos se avisamos a oficina e sempre
// recarregamos a página pra mostrar o estado real.
export async function aceitarContratoPublica(aluguelId: string, formData: FormData) {
  const nome = String(formData.get("nome") ?? "");
  const telefone = String(formData.get("telefone") ?? "");
  const supabase = await createClient();
  const { data } = await supabase
    .rpc("aceitar_contrato_locacao", { p_aluguel_id: aluguelId, p_nome: nome, p_telefone: telefone })
    .maybeSingle();

  if (data?.sucesso && data.mensagem === "Contrato aceito") {
    const { data: contrato } = await supabase.rpc("verificar_contrato_locacao", { p_aluguel_id: aluguelId }).maybeSingle();
    if (contrato) {
      await enviarPushParaTodos({
        title: "Contrato aceito online",
        body: `${contrato.cliente_nome} aceitou o contrato do aluguel #${String(contrato.numero).padStart(4, "0")}.`,
        url: "/locacao/alugueis",
      });
    }
  }

  redirect(`/locacao/contrato/${aluguelId}`);
}
