import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { PdvClient } from "@/components/pdv/pdv-client";
import type { VendaPdv } from "@/types";

export const dynamic = "force-dynamic";

interface VendaComItens extends VendaPdv {
  venda_itens: { descricao: string; quantidade: number }[];
}

export default async function PdvPage() {
  const [{ data: pecas }, { data: vendas }] = await Promise.all([
    supabase.from("pecas").select("*").order("nome", { ascending: true }),
    supabase
      .from("vendas_pdv")
      .select<string, VendaComItens>("*, venda_itens(descricao, quantidade)")
      .is("deletado_em", null)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  return (
    <div>
      <PageHeader
        title="Ponto de Venda"
        description="Venda rápida de peças e serviços avulsos."
        actions={
          <Badge variant="success" className="h-9 rounded-xl px-3 text-sm">
            Caixa Aberto
          </Badge>
        }
      />
      <PdvClient pecas={pecas ?? []} vendasRecentes={vendas ?? []} />
    </div>
  );
}
