"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOsTotais } from "@/lib/actions";
import { criarNotaFiscalComDecisao, criarNotaFiscal, tentarEmitir } from "@/lib/notas-fiscais-core";
import { cancelarNfse } from "@/lib/notaas";
import type { FormaPagamento } from "@/types";

interface OsClienteRow {
  cliente_id: string;
  clientes: { nome: string; cpf_cnpj: string | null } | null;
}

// Chamada a partir da página da OS, depois que ela está finalizada: decide
// se a nota é obrigatória (pagamento em cartão/PIX) ou se o cliente foi
// perguntado e respondeu (clienteDesejaNota só é usado quando não é
// obrigatória).
export async function criarNotaFiscalParaOs(osId: string, clienteDesejaNota: boolean | null) {
  const supabase = await createClient();

  const { data: existente } = await supabase
    .from("notas_fiscais")
    .select("id")
    .eq("os_id", osId)
    .neq("status", "cancelada")
    .maybeSingle();
  if (existente) throw new Error("Essa OS já tem uma nota fiscal lançada.");

  const [{ data: os }, { data: pagamentos }] = await Promise.all([
    supabase.from("ordens_servico").select<string, OsClienteRow>("cliente_id, clientes(nome, cpf_cnpj)").eq("id", osId).single(),
    supabase.from("os_pagamentos").select<string, { forma_pagamento: FormaPagamento }>("forma_pagamento").eq("os_id", osId),
  ]);
  if (!os?.clientes) throw new Error("Cliente da OS não encontrado");

  const { total } = await getOsTotais(osId);
  if (total <= 0) throw new Error("OS sem valor — nada a notear");

  await criarNotaFiscalComDecisao({
    origem: "os",
    osId,
    clienteId: os.cliente_id,
    clienteNome: os.clientes.nome,
    clienteDocumento: os.clientes.cpf_cnpj,
    valor: total,
    formasPagamento: (pagamentos ?? []).map((p) => p.forma_pagamento),
    clienteDesejaNota,
  });

  revalidatePath(`/ordens-servico/${osId}`);
  revalidatePath("/notas-fiscais");
}

// Nota avulsa: criada manualmente, sem vínculo com OS/venda — sempre que o
// operador decide lançar (não passa pela pergunta obrigatória/opcional).
export async function criarNotaFiscalAvulsa(input: {
  clienteId: string | null;
  clienteNome: string;
  clienteDocumento: string | null;
  valor: number;
}) {
  if (!input.clienteNome.trim()) throw new Error("Informe o nome do cliente");
  if (input.valor <= 0) throw new Error("Informe um valor válido");

  await criarNotaFiscal({
    origem: "avulsa",
    clienteId: input.clienteId,
    clienteNome: input.clienteNome.trim(),
    clienteDocumento: input.clienteDocumento,
    valor: input.valor,
    motivo: "opcional_cliente_sim",
  });

  revalidatePath("/notas-fiscais");
}

export async function reemitirNotaFiscal(notaId: string) {
  const supabase = await createClient();
  const { data: nota, error } = await supabase
    .from("notas_fiscais")
    .select("cliente_nome, cliente_documento, descricao_servico, valor")
    .eq("id", notaId)
    .single();
  if (error || !nota) throw new Error("Nota fiscal não encontrada");

  const { data: config } = await supabase
    .from("configuracoes")
    .select("nfse_codigo_servico, nfse_aliquota_iss")
    .eq("id", 1)
    .single();

  await supabase.from("notas_fiscais").update({ status: "pendente", erro_mensagem: null }).eq("id", notaId);
  await tentarEmitir(notaId, {
    clienteNome: nota.cliente_nome,
    clienteDocumento: nota.cliente_documento,
    descricaoServico: nota.descricao_servico,
    valor: nota.valor,
    codigoServico: config?.nfse_codigo_servico ?? null,
    aliquotaIss: config?.nfse_aliquota_iss ?? null,
  });

  revalidatePath("/notas-fiscais");
}

export async function cancelarNotaFiscalAction(notaId: string, motivo: string) {
  const supabase = await createClient();
  const { data: nota, error } = await supabase
    .from("notas_fiscais")
    .select("status, provider_id")
    .eq("id", notaId)
    .single();
  if (error || !nota) throw new Error("Nota fiscal não encontrada");

  if (nota.status === "emitida" && nota.provider_id) {
    const resultado = await cancelarNfse(nota.provider_id, motivo);
    if (!resultado.ok) throw new Error(resultado.erro);
  }

  await supabase.from("notas_fiscais").update({ status: "cancelada" }).eq("id", notaId);
  revalidatePath("/notas-fiscais");
}

// O cliente marcou como "não emitir" por engano, ou mudou de ideia — volta
// pra pendente e já tenta emitir.
export async function marcarNotaFiscalComoDesejada(notaId: string) {
  const supabase = await createClient();
  const { data: nota, error } = await supabase
    .from("notas_fiscais")
    .select("cliente_nome, cliente_documento, descricao_servico, valor, status")
    .eq("id", notaId)
    .single();
  if (error || !nota) throw new Error("Nota fiscal não encontrada");
  if (nota.status !== "nao_emitir") throw new Error("Essa nota não está marcada como 'não emitir'");

  const { data: config } = await supabase
    .from("configuracoes")
    .select("nfse_codigo_servico, nfse_aliquota_iss")
    .eq("id", 1)
    .single();

  await supabase
    .from("notas_fiscais")
    .update({ status: "pendente", motivo: "opcional_cliente_sim" })
    .eq("id", notaId);
  await tentarEmitir(notaId, {
    clienteNome: nota.cliente_nome,
    clienteDocumento: nota.cliente_documento,
    descricaoServico: nota.descricao_servico,
    valor: nota.valor,
    codigoServico: config?.nfse_codigo_servico ?? null,
    aliquotaIss: config?.nfse_aliquota_iss ?? null,
  });

  revalidatePath("/notas-fiscais");
}
