// Cliente HTTP para a Notaas (https://www.notaas.com.br), o gateway de
// NFS-e escolhido para a emissão automática.
//
// Base URL, autenticação (x-api-key) e o payload de POST /nfse abaixo
// conferem com a API Reference real da conta (aba "Emissão"). A Notaas
// emite de forma ASSÍNCRONA: a resposta chega com HTTP 202 (job
// publicado na fila) e o status final só é conhecido depois, por
// polling em GET /nfse/:id ou por webhook — as abas "Status", "Cancelar"
// e "Webhooks" da documentação ainda não foram conferidas aqui, então o
// parsing de consultarNfse/cancelarNfse abaixo continua sendo uma
// estimativa; ajuste parseNota() se o formato real divergir.
//
// A Notaas não tem um campo dedicado de "observações"/"informações
// complementares" na emissão — o único texto livre que chega na nota é
// servico.descricao, então observações do operador são concatenadas ali
// (ver emitirNfse).
//
// Credenciais nunca ficam no banco nem no código: NOTAAS_API_KEY é lida
// de variável de ambiente (configurada no Vercel, valor começando com
// "ntaas_..."), e o certificado digital é cadastrado direto no painel da
// Notaas, não neste sistema.
const NOTAAS_BASE_URL = process.env.NOTAAS_BASE_URL || "https://platform.notaas.com.br/api/v1";

export interface NotaasEmissaoInput {
  referenciaExterna: string;
  clienteNome: string;
  clienteDocumento: string | null;
  descricaoServico: string;
  valor: number;
  codigoServico: string | null;
  aliquotaIss: number | null;
  observacoes?: string | null;
}

export interface NotaasNota {
  providerId: string;
  status: "processando" | "emitida" | "erro";
  numeroNfse: string | null;
  codigoVerificacao: string | null;
  urlPdf: string | null;
  urlXml: string | null;
  erro: string | null;
}

export type NotaasResultado<T> = { ok: true; data: T } | { ok: false; erro: string };

function getApiKey(): string | null {
  return process.env.NOTAAS_API_KEY || null;
}

export function notaasConfigurada(): boolean {
  return getApiKey() !== null;
}

async function notaasFetch<T>(path: string, init?: RequestInit): Promise<NotaasResultado<T>> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      ok: false,
      erro: "Chave da Notaas não configurada (variável de ambiente NOTAAS_API_KEY ausente).",
    };
  }
  const url = `${NOTAAS_BASE_URL}${path}`;
  let res: Response;
  try {
    // Header em minúsculas, igual à documentação (x-api-key) — HTTP não
    // deveria se importar com maiúscula/minúscula, mas alguma camada de
    // borda (CDN/WAF) na frente da Notaas pode ser mais estrita que isso.
    res = await fetch(url, {
      ...init,
      headers: { "content-type": "application/json", "x-api-key": apiKey, ...init?.headers },
    });
  } catch (error) {
    return { ok: false, erro: error instanceof Error ? error.message : "Erro de conexão com a Notaas" };
  }

  const textoBruto = await res.text();
  let body: unknown = null;
  try {
    body = textoBruto ? JSON.parse(textoBruto) : null;
  } catch {
    body = null;
  }

  if (!res.ok) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const b = body as any;
    const mensagemEstruturada = body && typeof body === "object" && (b.message || b.erro || b.error);
    // Sem mensagem estruturada no corpo (ex.: resposta não é da Notaas, veio
    // de um CDN/WAF antes de chegar no app deles) — mostra a URL chamada e
    // um pedaço do corpo bruto, pra dar pista de diagnóstico direto no card
    // da nota em vez de só "Erro 404 na Notaas".
    const mensagem = mensagemEstruturada || `Erro ${res.status} em ${url}${textoBruto ? ": " + textoBruto.slice(0, 200) : ""}`;
    return { ok: false, erro: String(mensagem) };
  }
  return { ok: true, data: body as T };
}

function normalizarStatus(status: unknown): NotaasNota["status"] {
  if (status === "emitida" || status === "issued" || status === "authorized") return "emitida";
  if (status === "erro" || status === "error" || status === "rejected") return "erro";
  return "processando";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseNota(data: any): NotaasNota {
  return {
    providerId: String(data?.id ?? ""),
    status: normalizarStatus(data?.status),
    numeroNfse: data?.numero ?? data?.numero_nfse ?? null,
    codigoVerificacao: data?.codigo_verificacao ?? null,
    urlPdf: data?.url_pdf ?? data?.pdf_url ?? null,
    urlXml: data?.url_xml ?? data?.xml_url ?? null,
    erro: data?.erro ?? data?.motivo_erro ?? null,
  };
}

// cnpj/cpf são campos exclusivos entre si no payload da Notaas — decide
// qual mandar pela quantidade de dígitos do documento do cliente. Sem
// documento válido, omite o tomador inteiro: a API aceita emissão B2C
// pra consumidor final não identificado.
function tomadorPayload(nome: string, documento: string | null) {
  const digitos = (documento || "").replace(/\D/g, "");
  if (digitos.length === 11) return { cpf: digitos, nome };
  if (digitos.length === 14) return { cnpj: digitos, nome };
  return undefined;
}

export async function emitirNfse(input: NotaasEmissaoInput): Promise<NotaasResultado<NotaasNota>> {
  const descricao = input.observacoes ? `${input.descricaoServico}\n\n${input.observacoes}` : input.descricaoServico;
  const competencia = new Date().toISOString().slice(0, 7); // YYYY-MM

  const resultado = await notaasFetch<unknown>("/nfse", {
    method: "POST",
    body: JSON.stringify({
      referencia: input.referenciaExterna,
      tomador: tomadorPayload(input.clienteNome, input.clienteDocumento),
      servico: {
        codigo: input.codigoServico || undefined,
        descricao,
      },
      valores: {
        total: input.valor,
        aliquotaIss: input.aliquotaIss ?? 0,
      },
      competencia,
    }),
  });
  if (!resultado.ok) return resultado;
  return { ok: true, data: parseNota(resultado.data) };
}

export async function consultarNfse(providerId: string): Promise<NotaasResultado<NotaasNota>> {
  const resultado = await notaasFetch<unknown>(`/nfse/${providerId}`, { method: "GET" });
  if (!resultado.ok) return resultado;
  return { ok: true, data: parseNota(resultado.data) };
}

export async function cancelarNfse(providerId: string, motivo: string): Promise<NotaasResultado<NotaasNota>> {
  const resultado = await notaasFetch<unknown>(`/nfse/${providerId}/cancelar`, {
    method: "POST",
    body: JSON.stringify({ motivo }),
  });
  if (!resultado.ok) return resultado;
  return { ok: true, data: parseNota(resultado.data) };
}
