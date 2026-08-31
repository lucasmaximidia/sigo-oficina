import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/layout/page-header";
import { BalancoForm } from "@/components/estoque/balanco-form";
import { BalancoHistorico } from "@/components/estoque/balanco-historico";
import type { BalancoEstoque, BalancoEstoqueComItens, BalancoEstoqueItem } from "@/types";

export const dynamic = "force-dynamic";

interface BalancoRow extends BalancoEstoque {
  balanco_estoque_itens: BalancoEstoqueItem[];
}

export default async function BalancoEstoquePage() {
  const [{ data: pecas }, { data: balancosRaw }] = await Promise.all([
    supabase.from("pecas").select("*").order("nome", { ascending: true }),
    supabase
      .from("balancos_estoque")
      .select<string, BalancoRow>("*, balanco_estoque_itens(*)")
      .order("created_at", { ascending: false })
      .order("peca_nome", { referencedTable: "balanco_estoque_itens", ascending: true })
      .limit(30),
  ]);

  const balancos: BalancoEstoqueComItens[] = (balancosRaw ?? []).map((balanco) => {
    const { balanco_estoque_itens, ...resto } = balanco;
    return { ...resto, itens: balanco_estoque_itens ?? [] };
  });

  return (
    <div>
      <Link href="/estoque" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Voltar para Estoque
      </Link>
      <PageHeader
        title="Balanço de Estoque"
        description="Confira a quantidade física de cada item e ajuste o sistema a partir da contagem. Deixe em branco o que não for conferir agora."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BalancoForm pecas={pecas ?? []} />
        </div>
        <div>
          <BalancoHistorico balancos={balancos} />
        </div>
      </div>
    </div>
  );
}
