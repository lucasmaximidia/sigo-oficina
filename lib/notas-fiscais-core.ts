// Lógica de criação + emissão de nota fiscal, compartilhada entre a OS,
// o PDV e a emissão avulsa. Não é "use server" porque não é chamado
// direto de componente client — só por outras server actions.
import { createClient } from "@/lib/supabase/server";
import { nfseObrigatoria, motivoNotaFiscal } from "@/lib/notas-fiscais";
import { emitirNfse } from "@/lib/notaas";
import type { FormaPagamento, NotaFiscalMotivo, NotaFiscalOrigem } from "@/types";

interface ConfigNfse {
  codigoServico: string | null;
  aliquotaIss: number | null;
  descricaoPadrao: string;
}

async function getConfigNfse(): Promise<ConfigNfse> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("configuracoes")
    .select("nfse_codigo_servico, nfse_aliquota_iss, nfse_descricao_padrao")
    .eq("id", 1)
    .single();
  return {
    codigoServico: data?.nfse_codigo_servico ?? null,
    aliquotaIss: data?.nfse_aliquota_iss ?? null,
    descricaoPadrao: data?.nfse_descricao_padrao ?? "Serviço de assistência técnica em eletrodomésticos.",
  };
}

// Cria a linha em notas_fiscais e, se o caso pedir emissão (obrigatória ou
// o cliente pediu), tenta emitir na Notaas na hora. Nunca lança erro — a
// venda/OS já aconteceu independente do resultado da nota; falha vira
// status "erro" pra ser reemitida depois na tela de Notas Fiscais.
export async function criarNotaFiscal(input: {
  origem: NotaFiscalOrigem;
  osId?: string | null;
  vendaId?: string | null;
  clienteId: string | null;
  clienteNome: string;
  clienteDocumento: string | null;
  valor: number;
  motivo: NotaFiscalMotivo;
}) {
  // Venda/OS com valor zerado (ex: 100% de desconto, troca em garantia) não
  // gera nota — evita violar o check de valor > 0 no banco por uma venda
  // que, de resto, já foi concluída normalmente.
  if (input.valor <= 0) return null;

  const supabase = await createClient();
  const deveEmitir = input.motivo !== "opcional_cliente_nao";
  const config = deveEmitir ? await getConfigNfse() : null;
  const descricaoServico = config?.descricaoPadrao ?? "Serviço de assistência técnica em eletrodomésticos.";

  const { data: nota, error } = await supabase
    .from("notas_fiscais")
    .insert({
      origem: input.origem,
      os_id: input.osId ?? null,
      venda_id: input.vendaId ?? null,
      cliente_id: input.clienteId,
      cliente_nome: input.clienteNome,
      cliente_documento: input.clienteDocumento,
      descricao_servico: descricaoServico,
      valor: input.valor,
      motivo: input.motivo,
      status: deveEmitir ? "pendente" : "nao_emitir",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  if (deveEmitir && config) {
    await tentarEmitir(nota.id, {
      clienteNome: input.clienteNome,
      clienteDocumento: input.clienteDocumento,
      descricaoServico,
      valor: input.valor,
      codigoServico: config.codigoServico,
      aliquotaIss: config.aliquotaIss,
    });
  }

  return nota.id as string;
}

// Decide se a nota é obrigatória (cartão/PIX) ou opcional (dinheiro) a
// partir das formas de pagamento e cria a linha de acordo.
export async function criarNotaFiscalComDecisao(input: {
  origem: "os" | "venda_pdv";
  osId?: string | null;
  vendaId?: string | null;
  clienteId: string | null;
  clienteNome: string;
  clienteDocumento: string | null;
  valor: number;
  formasPagamento: FormaPagamento[];
  clienteDesejaNota: boolean | null;
}) {
  const obrigatoria = nfseObrigatoria(input.formasPagamento);
  const motivo = motivoNotaFiscal(obrigatoria, obrigatoria ? true : (input.clienteDesejaNota ?? false));
  return criarNotaFiscal({ ...input, motivo });
}

export async function tentarEmitir(
  notaId: string,
  dados: {
    clienteNome: string;
    clienteDocumento: string | null;
    descricaoServico: string;
    valor: number;
    codigoServico: string | null;
    aliquotaIss: number | null;
  }
) {
  const supabase = await createClient();
  const resultado = await emitirNfse({
    referenciaExterna: notaId,
    clienteNome: dados.clienteNome,
    clienteDocumento: dados.clienteDocumento,
    descricaoServico: dados.descricaoServico,
    valor: dados.valor,
    codigoServico: dados.codigoServico,
    aliquotaIss: dados.aliquotaIss,
  });

  if (!resultado.ok) {
    await supabase.from("notas_fiscais").update({ status: "erro", erro_mensagem: resultado.erro }).eq("id", notaId);
    return;
  }

  const nota = resultado.data;
  await supabase
    .from("notas_fiscais")
    .update({
      status: nota.status === "erro" ? "erro" : nota.status === "emitida" ? "emitida" : "pendente",
      provider_id: nota.providerId || null,
      numero_nfse: nota.numeroNfse,
      codigo_verificacao: nota.codigoVerificacao,
      url_pdf: nota.urlPdf,
      url_xml: nota.urlXml,
      erro_mensagem: nota.erro,
      emitida_em: nota.status === "emitida" ? new Date().toISOString() : null,
    })
    .eq("id", notaId);
}
