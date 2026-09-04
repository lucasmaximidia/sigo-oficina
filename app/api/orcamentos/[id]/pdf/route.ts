import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { OrcamentoPdf } from "@/components/orcamentos/orcamento-pdf";
import type { Orcamento } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface OrcamentoComCliente extends Orcamento {
  clientes: { nome: string; telefone: string | null } | null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const [{ data: orcamento }, { data: itens }, { data: config }] = await Promise.all([
    supabase
      .from("orcamentos")
      .select<string, OrcamentoComCliente>("*, clientes(nome, telefone)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("orcamento_itens").select("*").eq("orcamento_id", id).order("created_at", { ascending: true }),
    supabase.from("configuracoes").select("*").eq("id", 1).single(),
  ]);

  if (!orcamento || !config) {
    return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 });
  }

  const cliente = orcamento.clientes;

  const buffer = await renderToBuffer(
    OrcamentoPdf({
      orcamento,
      itens: itens ?? [],
      config,
      clienteNome: cliente?.nome ?? "Cliente",
      clienteTelefone: cliente?.telefone ?? null,
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="orcamento-${String(orcamento.numero).padStart(4, "0")}.pdf"`,
    },
  });
}
