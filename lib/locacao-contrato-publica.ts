"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
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
  const fusoHorario = String(formData.get("fusoHorario") ?? "");
  // Latitude/longitude só vêm preenchidas se o navegador do cliente
  // conseguiu obter e autorizar a localização — não é obrigatório pra
  // concluir o aceite (ver ContratoAceiteForm), então ficam nulas quando o
  // GPS falha, demora ou é negado.
  const latitudeRaw = formData.get("latitude");
  const longitudeRaw = formData.get("longitude");
  const latitude = latitudeRaw ? Number(latitudeRaw) : null;
  const longitude = longitudeRaw ? Number(longitudeRaw) : null;
  // IP de quem está aceitando, a partir dos cabeçalhos que a Vercel injeta
  // na requisição (não tem como ler isso direto do socket numa server
  // action) — junto com o user-agent, serve de evidência do aceite.
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  const ip = (forwardedFor ? forwardedFor.split(",")[0].trim() : h.get("x-real-ip")) ?? "";
  const userAgent = h.get("user-agent") ?? "";
  const supabase = await createClient();
  const { data } = await supabase
    .rpc("aceitar_contrato_locacao", {
      p_aluguel_id: aluguelId,
      p_nome: nome,
      p_telefone: telefone,
      p_ip: ip,
      p_user_agent: userAgent,
      p_fuso_horario: fusoHorario,
      p_latitude: latitude,
      p_longitude: longitude,
    })
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
