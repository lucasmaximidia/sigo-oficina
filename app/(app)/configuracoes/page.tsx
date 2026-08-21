import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/layout/page-header";
import { EmpresaForm } from "@/components/configuracoes/empresa-form";
import { EtiquetaForm } from "@/components/configuracoes/etiqueta-form";
import { DashboardForm } from "@/components/configuracoes/dashboard-form";
import { ResetSistemaDialog } from "@/components/configuracoes/reset-sistema-dialog";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const { data: config } = await supabase.from("configuracoes").select("*").eq("id", 1).single();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Configurações do Sistema" description="Gerencie as informações base da sua oficina e políticas do sistema." />
      <div className="flex flex-col gap-5">
        {config && <EmpresaForm config={config} />}
        {config && <EtiquetaForm config={config} />}
        {config && <DashboardForm config={config} />}
        <ResetSistemaDialog />
      </div>
    </div>
  );
}
