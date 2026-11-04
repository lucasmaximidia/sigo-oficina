// Lógica de criação + emissão de nota fiscal, compartilhada entre a OS,
// o PDV e a emissão avulsa. Não é "use server" porque não é chamado
// direto de componente client — só por outras server actions.
import { createClient } from "@/lib/supabase/server";
import { nfseObrigatoria, motivoNotaFiscal } from "@/lib/notas-fiscais";
import { emitirNfse } from "@/lib/notaas";
import { cpfCnpjValido } from "@/lib/cpf";
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
  observacoes?: string | null;
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
      observacoes: input.observacoes?.trim() || null,
      status: deveEmitir ? "pendente" : "nao_emitir",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  if (deveEmitir && config) {
    const endereco = input.clienteId ? await getClienteEndereco(input.clienteId) : null;
    await tentarEmitir(nota.id, {
      clienteNome: input.clienteNome,
      clienteDocumento: input.clienteDocumento,
      clienteEndereco: endereco?.endereco ?? null,
      clienteBairro: endereco?.bairro ?? null,
      clienteCidade: endereco?.cidade ?? null,
      clienteEstado: endereco?.estado ?? null,
      descricaoServico,
      valor: input.valor,
      codigoServico: config.codigoServico,
      aliquotaIss: config.aliquotaIss,
      observacoes: input.observacoes,
    });
  }

  return nota.id as string;
}

// Endereço do tomador não é obrigatório pra Notaas, mas sem ele a nota sai
// sem cidade/UF — busca do cadastro do cliente quando existe, pra não
// precisar perguntar de novo numa tela separada.
export async function getClienteEndereco(clienteId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clientes")
    .select("endereco, bairro, cidade, estado")
    .eq("id", clienteId)
    .maybeSingle();
  return data;
}

async function getNfseObrigatoriaAtiva(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.from("configuracoes").select("nfse_obrigatoria_cartao_pix").eq("id", 1).single();
  return data?.nfse_obrigatoria_cartao_pix ?? false;
}

// Decide se a nota é obrigatória (cartão/PIX, só quando a obrigatoriedade
// está ativa em Configurações) ou opcional (dinheiro, ou cartão/PIX com a
// obrigatoriedade desativada) a partir das formas de pagamento, e cria a
// linha de acordo.
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
  const obrigatoriaAtiva = await getNfseObrigatoriaAtiva();
  const obrigatoria = nfseObrigatoria(input.formasPagamento, obrigatoriaAtiva);
  const motivo = motivoNotaFiscal(obrigatoria, obrigatoria ? true : (input.clienteDesejaNota ?? false));
  return criarNotaFiscal({ ...input, motivo });
}

export async function tentarEmitir(
  notaId: string,
  dados: {
    clienteNome: string;
    clienteDocumento: string | null;
    clienteEndereco?: string | null;
    clienteBairro?: string | null;
    clienteCidade?: string | null;
    clienteEstado?: string | null;
    descricaoServico: string;
    valor: number;
    codigoServico: string | null;
    aliquotaIss: number | null;
    observacoes?: string | null;
  }
) {
  const supabase = await createClient();

  // Não emite sem CPF/CNPJ válido do cliente — mesmo que a Notaas aceite
  // consumidor final não identificado, a oficina quer sempre nota com
  // documento. Fica com status "erro" até alguém completar o cadastro do
  // cliente e reemitir.
  if (!cpfCnpjValido(dados.clienteDocumento ?? "")) {
    await supabase
      .from("notas_fiscais")
      .update({
        status: "erro",
        erro_mensagem: "Cliente sem CPF/CNPJ válido cadastrado — complete o cadastro do cliente e reemita.",
      })
      .eq("id", notaId);
    return;
  }

  const resultado = await emitirNfse({
    referenciaExterna: notaId,
    clienteNome: dados.clienteNome,
    clienteDocumento: dados.clienteDocumento,
    clienteEndereco: dados.clienteEndereco,
    clienteBairro: dados.clienteBairro,
    clienteCidade: dados.clienteCidade,
    clienteEstado: dados.clienteEstado,
    descricaoServico: dados.descricaoServico,
    valor: dados.valor,
    codigoServico: dados.codigoServico,
    aliquotaIss: dados.aliquotaIss,
    observacoes: dados.observacoes,
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
