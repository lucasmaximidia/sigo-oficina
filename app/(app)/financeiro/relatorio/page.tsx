import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { RelatorioForm } from "@/components/financeiro/relatorio-form";
import { FechamentoMensalForm } from "@/components/financeiro/fechamento-mensal-form";

export const dynamic = "force-dynamic";

export default async function RelatorioFinanceiroPage() {
  const supabase = await createClient();
  const { data: lojas } = await supabase.from("lojas_parceiras").select("*").order("nome", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/financeiro" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Voltar para Financeiro
      </Link>
      <PageHeader title="Relatório Financeiro" description="Gere um PDF com os serviços realizados no período escolhido." />
      <div className="flex flex-col gap-6">
        <RelatorioForm lojas={lojas ?? []} />
        <FechamentoMensalForm />
      </div>
    </div>
  );
}
