import Link from "next/link";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { OrcamentoStatusTabs } from "@/components/orcamentos/status-tabs";
import { OrcamentosLista, type OrcamentoListItem } from "@/components/orcamentos/orcamentos-lista";
import type { OrcamentoStatus } from "@/types";

export const dynamic = "force-dynamic";

interface OrcamentoListRow {
  id: string;
  numero: number;
  status: OrcamentoStatus;
  data_validade: string;
  desconto: number;
  created_at: string;
  clientes: { nome: string } | null;
  orcamento_itens: { quantidade: number; valor_unitario: number }[];
}

export default async function OrcamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFiltro = (params.status as OrcamentoStatus | undefined) ?? "todos";

  const { data: orcamentos } = await supabase
    .from("orcamentos")
    .select<string, OrcamentoListRow>(
      "id, numero, status, data_validade, desconto, created_at, clientes(nome), orcamento_itens(quantidade, valor_unitario)"
    )
    .order("created_at", { ascending: false });

  const hojeStr = new Date().toISOString().slice(0, 10);

  const orcamentosComTotal: OrcamentoListItem[] = (orcamentos ?? []).map((orc) => {
    const totalItens = orc.orcamento_itens.reduce((acc, i) => acc + i.quantidade * i.valor_unitario, 0);
    const total = Math.max(0, totalItens - orc.desconto);
    const vencido = orc.data_validade < hojeStr && orc.status !== "aprovado" && orc.status !== "recusado";
    return {
      id: orc.id,
      numero: orc.numero,
      clienteNome: orc.clientes?.nome ?? "—",
      total,
      dataValidade: orc.data_validade,
      createdAt: orc.created_at,
      statusExibido: vencido ? "expirado" : orc.status,
    };
  });

  const orcamentosFiltrados =
    statusFiltro === "todos"
      ? orcamentosComTotal
      : orcamentosComTotal.filter((orc) => orc.statusExibido === statusFiltro);

  return (
    <div>
      <PageHeader
        title="Orçamentos"
        description="Monte e envie orçamentos profissionais para seus clientes."
        actions={
          <Button asChild>
            <Link href="/orcamentos/novo">
              <Plus className="size-4" />
              Novo Orçamento
            </Link>
          </Button>
        }
      />

      <div className="mb-4">
        <OrcamentoStatusTabs active={statusFiltro} />
      </div>

      <OrcamentosLista orcamentos={orcamentosFiltrados} />
    </div>
  );
}
