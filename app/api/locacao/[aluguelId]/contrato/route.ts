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
  valor_pago: number;
  forma_pagamento: LocacaoFormaPagamento;
  status_pagamento: LocacaoStatusPagamento;
  observacoes: string | null;
  aceite_online_em: string | null;
  aceite_online_nome: string | null;
  aceite_online_telefone: string | null;
  aceite_online_ip: string | null;
  aceite_online_user_agent: string | null;
  locacao_clientes: { nome: string; cpf: string | null; telefone: string | null } | null;
  locacao_veiculos: { tipo: LocacaoVeiculoTipo; marca: string; modelo: string; cor: string | null; chassi: string } | null;
}

export async function GET(request: Request, { params }: { params: Promise<{ aluguelId: string }> }) {
  const supabase = await createClient();
  const { aluguelId } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let aluguel: AluguelComRelacoes | null = null;

  if (user) {
    // Equipe logada: acesso direto à tabela, sem exigir contrato já assinado
    // — é assim que a oficina imprime/confere o contrato antes de enviar.
    const { data } = await supabase
      .from("locacao_alugueis")
      .select<string, AluguelComRelacoes>(
        "numero, data_retirada, data_prevista_devolucao, valor, valor_pago, forma_pagamento, status_pagamento, observacoes, aceite_online_em, aceite_online_nome, aceite_online_telefone, aceite_online_ip, aceite_online_user_agent, locacao_clientes(nome, cpf, telefone), locacao_veiculos(tipo, marca, modelo, cor, chassi)"
      )
      .eq("id", aluguelId)
      .maybeSingle();
    aluguel = data;
  } else {
    // Página pública (sem login): dados vêm das mesmas funções com
    // privilégio elevado usadas em /locacao/contrato/[id], já que a tabela
    // em si só libera leitura para usuário autenticado. O cliente só pode
    // baixar o PDF depois de ter assinado o aceite online.
    const [{ data: contrato }, { data: aceite }] = await Promise.all([
      supabase.rpc("verificar_contrato_locacao", { p_aluguel_id: aluguelId }).maybeSingle(),
      supabase.rpc("obter_contrato_aceite_completo", { p_aluguel_id: aluguelId }).maybeSingle(),
    ]);

    if (!contrato) {
      return NextResponse.json({ error: "Aluguel não encontrado" }, { status: 404 });
    }
    if (!aceite?.aceite_online_em) {
      return NextResponse.json({ error: "Assine o contrato antes de baixar o PDF" }, { status: 403 });
    }

    aluguel = {
      numero: contrato.numero,
      data_retirada: contrato.data_retirada,
      data_prevista_devolucao: contrato.data_prevista_devolucao,
      valor: contrato.valor,
      valor_pago: aceite.valor_pago,
      forma_pagamento: contrato.forma_pagamento as LocacaoFormaPagamento,
      status_pagamento: contrato.status_pagamento as LocacaoStatusPagamento,
      observacoes: contrato.observacoes,
      aceite_online_em: aceite.aceite_online_em,
      aceite_online_nome: aceite.aceite_online_nome,
      aceite_online_telefone: aceite.aceite_online_telefone,
      aceite_online_ip: aceite.aceite_online_ip,
      aceite_online_user_agent: aceite.aceite_online_user_agent,
      locacao_clientes: { nome: contrato.cliente_nome, cpf: contrato.cliente_cpf, telefone: contrato.cliente_telefone },
      locacao_veiculos: {
        tipo: contrato.veiculo_tipo as LocacaoVeiculoTipo,
        marca: contrato.veiculo_marca,
        modelo: contrato.veiculo_modelo,
        cor: contrato.veiculo_cor,
        chassi: contrato.veiculo_chassi,
      },
    };
  }

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
      valorPago: aluguel.valor_pago,
      formaPagamento: aluguel.forma_pagamento,
      statusPagamento: aluguel.status_pagamento,
      observacoes: aluguel.observacoes,
      contratoUrl,
      qrCodeDataUrl,
      aceiteOnlineEm: aluguel.aceite_online_em,
      aceiteOnlineNome: aluguel.aceite_online_nome,
      aceiteOnlineTelefone: aluguel.aceite_online_telefone,
      aceiteOnlineIp: aluguel.aceite_online_ip,
      aceiteOnlineUserAgent: aluguel.aceite_online_user_agent,
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="contrato-locacao-${String(aluguel.numero).padStart(4, "0")}.pdf"`,
    },
  });
}
