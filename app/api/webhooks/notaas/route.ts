import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

// Recebe os eventos assíncronos da Notaas (emissão aceita como job em fila
// — ver lib/notaas.ts) e atualiza a nota fiscal correspondente. URL a
// cadastrar no painel da Notaas: Webhooks > Endpoints > Adicionar Endpoint.
//
// A Notaas manda o tipo do evento no header X-Notaas-Event e, opcionalmente,
// uma assinatura em X-Notaas-Signature calculada com o "secret" configurado
// no endpoint (NOTAAS_WEBHOOK_SECRET). O algoritmo exato de assinatura não
// está documentado na página que recebemos — assumimos HMAC-SHA256 do corpo
// bruto, o padrão mais comum (Stripe/GitHub). Por isso a verificação abaixo
// é best-effort: se não bater, só loga um aviso e continua processando (não
// descarta o evento), pra não quebrar a emissão inteira por causa de um
// algoritmo mal adivinhado. Também não sabemos o formato exato do corpo —
// parseEvento() tenta vários nomes de campo possíveis.
function verificarAssinatura(corpoBruto: string, assinatura: string | null): boolean {
  const secret = process.env.NOTAAS_WEBHOOK_SECRET;
  if (!secret || !assinatura) return true; // sem secret configurado, não dá pra validar
  try {
    const esperado = crypto.createHmac("sha256", secret).update(corpoBruto).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(esperado), Buffer.from(assinatura));
  } catch {
    return false;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function campo(obj: any, ...caminhos: string[]): string | null {
  for (const caminho of caminhos) {
    const valor = caminho.split(".").reduce((acc, chave) => (acc == null ? acc : acc[chave]), obj);
    if (valor !== undefined && valor !== null && valor !== "") return String(valor);
  }
  return null;
}

// Baixa o PDF da Notaas e guarda uma cópia permanente no nosso Storage —
// não depender do link deles ficar no ar pra sempre. Se qualquer passo
// falhar (rede, formato inesperado), cai pro link original da Notaas em
// vez de deixar a nota sem PDF nenhum.
async function salvarPdfPermanente(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  notaId: string,
  urlPdfOriginal: string | null
): Promise<string | null> {
  if (!urlPdfOriginal) return null;
  try {
    const res = await fetch(urlPdfOriginal);
    if (!res.ok) return urlPdfOriginal;
    const bytes = await res.arrayBuffer();
    const caminho = `${notaId}.pdf`;
    const { error } = await supabase.storage
      .from("notas-fiscais")
      .upload(caminho, bytes, { contentType: "application/pdf", upsert: true });
    if (error) {
      console.warn("Webhook Notaas: falhou ao salvar PDF no Storage, mantendo link original", error);
      return urlPdfOriginal;
    }
    const { data } = supabase.storage.from("notas-fiscais").getPublicUrl(caminho);
    return data?.publicUrl || urlPdfOriginal;
  } catch (error) {
    console.warn("Webhook Notaas: erro ao baixar/salvar PDF, mantendo link original", error);
    return urlPdfOriginal;
  }
}

export async function POST(request: Request) {
  const corpoBruto = await request.text();
  const assinatura = request.headers.get("x-notaas-signature");
  if (!verificarAssinatura(corpoBruto, assinatura)) {
    console.warn("Webhook Notaas: assinatura não confere (ver comentário em route.ts)");
  }

  const evento = request.headers.get("x-notaas-event") || "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any = null;
  try {
    body = JSON.parse(corpoBruto);
  } catch {
    return NextResponse.json({ ok: false, erro: "JSON inválido" }, { status: 400 });
  }

  // Só nos interessam eventos de NFS-e — ignora nfe.*/nfce.*/batch.* sem erro.
  if (!evento.startsWith("nfse.")) {
    return NextResponse.json({ ok: true, ignorado: evento });
  }

  const referencia = campo(body, "referencia", "data.referencia", "nfse.referencia");
  const providerId = campo(body, "invoiceId", "data.invoiceId", "id", "data.id", "nfse.id");
  const supabase = createServiceClient();

  let notaId: string | null = referencia;
  if (!notaId && providerId) {
    const { data } = await supabase.from("notas_fiscais").select("id").eq("provider_id", providerId).maybeSingle();
    notaId = data?.id ?? null;
  }
  if (!notaId) {
    console.warn("Webhook Notaas: não achei a nota (sem referencia/provider_id reconhecível)", { evento, body });
    return NextResponse.json({ ok: true, aviso: "nota não encontrada" });
  }

  if (evento === "nfse.issued" || evento === "nfse.documents_ready") {
    const urlPdfNotaas = campo(body, "urlPdf", "data.urlPdf", "nfse.urlPdf", "url_pdf", "data.url_pdf");
    const urlPdf = await salvarPdfPermanente(supabase, notaId, urlPdfNotaas);
    await supabase
      .from("notas_fiscais")
      .update({
        status: "emitida",
        provider_id: providerId,
        numero_nfse: campo(body, "numeroNfse", "data.numeroNfse", "numero", "data.numero", "nfse.numero"),
        codigo_verificacao: campo(body, "chNFSe", "data.chNFSe", "codigoVerificacao", "data.codigoVerificacao", "nfse.codigoVerificacao"),
        url_pdf: urlPdf,
        url_xml: campo(body, "urlXml", "data.urlXml", "nfse.urlXml", "url_xml", "data.url_xml"),
        erro_mensagem: null,
        emitida_em: new Date().toISOString(),
      })
      .eq("id", notaId);
  } else if (evento === "nfse.error") {
    await supabase
      .from("notas_fiscais")
      .update({
        status: "erro",
        provider_id: providerId,
        erro_mensagem: campo(body, "motivo", "data.motivo", "erro", "data.erro", "mensagem", "data.mensagem") ?? "Erro na emissão (Notaas)",
      })
      .eq("id", notaId);
  } else if (evento === "nfse.cancelled") {
    await supabase.from("notas_fiscais").update({ status: "cancelada" }).eq("id", notaId);
  }

  return NextResponse.json({ ok: true });
}
