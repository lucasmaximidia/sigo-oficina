// Cliente HTTP para a Notaas (https://www.notaas.com.br), o gateway de
// NFS-e escolhido para a emissão automática.
//
// IMPORTANTE: a URL base e o formato de payload abaixo são uma estimativa
// a partir do material público da Notaas (autenticação por cabeçalho
// X-API-Key, chaves sk_test_/sk_live_, API REST com JSON) — não tivemos
// acesso à documentação completa da conta ainda. Antes de usar em
// produção, confira no painel da Notaas (Documentação da API) os
// endpoints e nomes de campo reais e ajuste as três funções abaixo; o
// resto do sistema (banco, telas, regra obrigatória/opcional) não precisa
// mudar, só esta camada.
//
// Credenciais nunca ficam no banco nem no código: NOTAAS_API_KEY é lida
// de variável de ambiente (configurada no Vercel), e o certificado
// digital é cadastrado direto no painel da Notaas, não neste sistema.
const NOTAAS_BASE_URL = process.env.NOTAAS_BASE_URL || "https://api.notaas.com.br/v1";

export interface NotaasEmissaoInput {
  referenciaExterna: string;
  clienteNome: string;
  clienteDocumento: string | null;
  descricaoServico: string;
  valor: number;
  codigoServico: string | null;
  aliquotaIss: number | null;
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
  let res: Response;
  try {
    res = await fetch(`${NOTAAS_BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", "X-API-Key": apiKey, ...init?.headers },
    });
  } catch (error) {
    return { ok: false, erro: error instanceof Error ? error.message : "Erro de conexão com a Notaas" };
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const mensagem =
      (body && typeof body === "object" && (body.message || body.erro || body.error)) || `Erro ${res.status} na Notaas`;
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

export async function emitirNfse(input: NotaasEmissaoInput): Promise<NotaasResultado<NotaasNota>> {
  const resultado = await notaasFetch<unknown>("/nfse", {
    method: "POST",
    body: JSON.stringify({
      referencia_externa: input.referenciaExterna,
      tomador: { nome: input.clienteNome, documento: input.clienteDocumento },
      servico: {
        descricao: input.descricaoServico,
        valor: input.valor,
        codigo: input.codigoServico,
        aliquota_iss: input.aliquotaIss,
      },
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
