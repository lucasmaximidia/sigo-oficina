import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { supabase } from "@/lib/supabase";
import { CertificadoPdf } from "@/components/garantias/certificado-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface OsComRelacoes {
  id: string;
  numero: number;
  status: string;
  data_finalizacao: string | null;
  garantia_dias: number;
  clientes: { nome: string } | null;
  equipamentos: { tipo: string; marca: string | null; modelo: string | null; numero_serie: string | null } | null;
}

export async function GET(request: Request, { params }: { params: Promise<{ osId: string }> }) {
  const { osId } = await params;

  const [{ data: os }, { data: config }] = await Promise.all([
    supabase
      .from("ordens_servico")
      .select<string, OsComRelacoes>(
        "id, numero, status, data_finalizacao, garantia_dias, clientes(nome), equipamentos(tipo, marca, modelo, numero_serie)"
      )
      .eq("id", osId)
      .maybeSingle(),
    supabase.from("configuracoes").select("*").eq("id", 1).single(),
  ]);

  if (!os || !config) {
    return NextResponse.json({ error: "Ordem de serviço não encontrada" }, { status: 404 });
  }
  if (os.status !== "finalizado" || !os.data_finalizacao) {
    return NextResponse.json({ error: "A garantia só é emitida após a OS ser finalizada" }, { status: 400 });
  }

  const dataInicio = os.data_finalizacao.slice(0, 10);
  const expiracao = new Date(os.data_finalizacao);
  expiracao.setDate(expiracao.getDate() + os.garantia_dias);
  const dataExpiracao = expiracao.toISOString().slice(0, 10);

  const equipamento = os.equipamentos;
  const equipamentoDescricao = equipamento
    ? [equipamento.tipo, equipamento.marca, equipamento.modelo].filter(Boolean).join(" ")
    : "Equipamento não informado";

  let qrCodeDataUrl: string | null = null;
  if (config.garantia_qrcode) {
    const origin = new URL(request.url).origin;
    const verificationUrl = `${origin}/garantias/verificar/${os.id}`;
    qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 200 });
  }

  const buffer = await renderToBuffer(
    CertificadoPdf({
      numero: os.numero,
      clienteNome: os.clientes?.nome ?? "Cliente",
      equipamentoDescricao,
      numeroSerie: equipamento?.numero_serie ?? null,
      dataInicio,
      dataExpiracao,
      garantiaDias: os.garantia_dias,
      config,
      qrCodeDataUrl,
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="garantia-os-${String(os.numero).padStart(4, "0")}.pdf"`,
    },
  });
}
