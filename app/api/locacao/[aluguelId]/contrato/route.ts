import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";
import { ContratoLocacaoPdf } from "@/components/locacao/contrato-pdf";
import type { LocacaoFormaPagamento, LocacaoStatusPagamento, LocacaoVeiculoTipo } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AluguelComRelacoes {
  numero: number;
  data_retirada: string;
  data_prevista_devolucao: string;
  valor: number;
  forma_pagamento: LocacaoFormaPagamento;
  status_pagamento: LocacaoStatusPagamento;
  observacoes: string | null;
  locacao_clientes: { nome: string; cpf: string | null; telefone: string | null } | null;
  locacao_veiculos: { tipo: LocacaoVeiculoTipo; marca: string; modelo: string; cor: string | null; chassi: string } | null;
}

export async function GET(request: Request, { params }: { params: Promise<{ aluguelId: string }> }) {
  const supabase = await createClient();
  const { aluguelId } = await params;

  const { data: aluguel } = await supabase
    .from("locacao_alugueis")
    .select<string, AluguelComRelacoes>(
      "numero, data_retirada, data_prevista_devolucao, valor, forma_pagamento, status_pagamento, observacoes, locacao_clientes(nome, cpf, telefone), locacao_veiculos(tipo, marca, modelo, cor, chassi)"
    )
    .eq("id", aluguelId)
    .maybeSingle();

  if (!aluguel || !aluguel.locacao_clientes || !aluguel.locacao_veiculos) {
    return NextResponse.json({ error: "Aluguel não encontrado" }, { status: 404 });
  }

  const origin = new URL(request.url).origin;
  const contratoUrl = `${origin}/locacao/contrato/${aluguelId}`;
  const qrCodeDataUrl = await QRCode.toDataURL(contratoUrl, { margin: 1, width: 200 });

  const buffer = await renderToBuffer(
    ContratoLocacaoPdf({
      numero: aluguel.numero,
      cliente: aluguel.locacao_clientes,
      veiculo: aluguel.locacao_veiculos,
      dataRetirada: aluguel.data_retirada,
      dataPrevistaDevolucao: aluguel.data_prevista_devolucao,
      valor: aluguel.valor,
      formaPagamento: aluguel.forma_pagamento,
      statusPagamento: aluguel.status_pagamento,
      observacoes: aluguel.observacoes,
      contratoUrl,
      qrCodeDataUrl,
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="contrato-locacao-${String(aluguel.numero).padStart(4, "0")}.pdf"`,
    },
  });
}
