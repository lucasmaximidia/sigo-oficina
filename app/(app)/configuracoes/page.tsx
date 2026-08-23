import Link from "next/link";
import { Trash2, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
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
        <Card>
          <Link href="/configuracoes/lixeira">
            <CardContent className="flex items-center justify-between gap-3 py-4">
              <div className="flex items-center gap-2.5">
                <Trash2 className="size-4.5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Lixeira</p>
                  <p className="text-xs text-muted-foreground">Restaure contas, despesas e vendas excluídas.</p>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </CardContent>
          </Link>
        </Card>
        <ResetSistemaDialog />
      </div>
    </div>
  );
}
