import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/layout/page-header";
import { NovaOsForm } from "@/components/os/nova-os-form";

export const dynamic = "force-dynamic";

export default async function NovaOsPage() {
  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nome, telefone")
    .order("nome", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Nova Ordem de Serviço" description="Registre os dados do cliente, equipamento e problema relatado." />
      <NovaOsForm clientes={clientes ?? []} />
    </div>
  );
}
