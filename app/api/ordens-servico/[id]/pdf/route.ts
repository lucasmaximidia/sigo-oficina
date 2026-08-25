import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { supabase } from "@/lib/supabase";
import { OsPdf } from "@/components/os/os-pdf";
import type { OrdemServico } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface OsComRelacoes extends OrdemServico {
  clientes: { nome: string; telefone: string | null } | null;
  equipamentos: { tipo: string; marca: string | null; modelo: string | null; numero_serie: string | null } | null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [{ data: os }, { data: itens }, { data: config }] = await Promise.all([
    supabase
      .from("ordens_servico")
      .select<string, OsComRelacoes>(
        "*, clientes(nome, telefone), equipamentos(tipo, marca, modelo, numero_serie)"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("os_itens").select("*").eq("os_id", id).order("created_at", { ascending: true }),
    supabase.from("configuracoes").select("*").eq("id", 1).single(),
  ]);

  if (!os || !config) {
    return NextResponse.json({ error: "Ordem de serviço não encontrada" }, { status: 404 });
  }

  const equipamento = os.equipamentos;
  const equipamentoDescricao = equipamento
    ? [equipamento.marca, equipamento.modelo].filter(Boolean).join(" ") || equipamento.tipo
    : "Equipamento não informado";

  const buffer = await renderToBuffer(
    OsPdf({
      os,
      itens: itens ?? [],
      config,
      clienteNome: os.clientes?.nome ?? "Cliente",
      clienteTelefone: os.clientes?.telefone ?? null,
      equipamentoDescricao,
      numeroSerie: equipamento?.numero_serie ?? null,
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="os-${String(os.numero).padStart(4, "0")}.pdf"`,
    },
  });
}
