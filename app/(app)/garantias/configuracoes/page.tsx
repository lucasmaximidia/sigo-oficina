import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/layout/page-header";
import { ConfigGarantiaForm } from "@/components/garantias/config-garantia-form";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesGarantiaPage() {
  const { data: config } = await supabase.from("configuracoes").select("*").eq("id", 1).single();

  return (
    <div>
      <Link href="/garantias" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Voltar para Garantias
      </Link>
      <PageHeader title="Configurações de Garantia" description="Gerencie os termos, prazos e alertas para os certificados de garantia gerados pelo sistema." />
      {config && <ConfigGarantiaForm config={config} />}
    </div>
  );
}
