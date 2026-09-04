import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { NovaOrcamentoForm } from "@/components/orcamentos/nova-orcamento-form";

export const dynamic = "force-dynamic";

export default async function NovoOrcamentoPage() {
  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nome, telefone")
    .order("nome", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Novo Orçamento" description="Monte um orçamento com peças e mão de obra para o cliente." />
      <NovaOrcamentoForm clientes={clientes ?? []} />
    </div>
  );
}
