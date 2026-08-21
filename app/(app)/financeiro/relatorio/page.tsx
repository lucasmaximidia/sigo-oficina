import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RelatorioForm } from "@/components/financeiro/relatorio-form";

export default function RelatorioFinanceiroPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/financeiro" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Voltar para Financeiro
      </Link>
      <PageHeader title="Relatório Financeiro" description="Gere um PDF com os serviços realizados no período escolhido." />
      <RelatorioForm />
    </div>
  );
}
