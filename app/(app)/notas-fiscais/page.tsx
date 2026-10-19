import Link from "next/link";
import { Clock, CheckCircle2, AlertTriangle, Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { NotaFiscalCard } from "@/components/notas-fiscais/nota-fiscal-card";
import { NotaFiscalAvulsaDialog } from "@/components/notas-fiscais/nota-fiscal-avulsa-dialog";
import { notaasConfigurada } from "@/lib/notaas";
import type { NotaFiscalStatus } from "@/types";

export const dynamic = "force-dynamic";

export default async function NotasFiscaisPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const filtro = (params.filtro as NotaFiscalStatus | undefined) ?? "todas";

  const [{ data: notas }, { data: clientes }] = await Promise.all([
    supabase.from("notas_fiscais").select("*").order("created_at", { ascending: false }),
    supabase.from("clientes").select("id, nome, cpf_cnpj").order("nome", { ascending: true }),
  ]);

  const todasNotas = notas ?? [];
  const pendentes = todasNotas.filter((n) => n.status === "pendente");
  const emitidas = todasNotas.filter((n) => n.status === "emitida");
  const comErro = todasNotas.filter((n) => n.status === "erro");

  const filtradas = filtro === "todas" ? todasNotas : todasNotas.filter((n) => n.status === filtro);

  const tabs: { value: string; label: string }[] = [
    { value: "todas", label: "Todas" },
    { value: "pendente", label: "Pendentes" },
    { value: "emitida", label: "Emitidas" },
    { value: "erro", label: "Com erro" },
    { value: "nao_emitir", label: "Cliente não quis" },
  ];

  return (
    <div>
      <PageHeader
        title="Notas Fiscais"
        description="Acompanhe a emissão de NFS-e das OS, vendas do PDV e notas avulsas."
        actions={<NotaFiscalAvulsaDialog clientes={clientes ?? []} />}
      />

      {!notaasConfigurada() && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-warning">
          <AlertTriangle className="mt-0.5 size-4.5 shrink-0" />
          <p>
            A emissão automática ainda não está configurada (falta o certificado digital e a chave da Notaas). As
            notas continuam sendo lançadas aqui com status <strong>Pendente</strong>, prontas pra emitir assim que a
            configuração estiver pronta.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
        <StatCard icon={Clock} label="Pendentes" value={pendentes.length} />
        <StatCard icon={CheckCircle2} label="Emitidas" value={emitidas.length} />
        <StatCard icon={AlertTriangle} label="Com erro" value={comErro.length} />
      </div>

      <div className="mt-5 mb-4 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/notas-fiscais?filtro=${tab.value}`}
            className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
              filtro === tab.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-secondary"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtradas.map((nota) => (
          <NotaFiscalCard key={nota.id} nota={nota} />
        ))}
        {filtradas.length === 0 && (
          <div className="col-span-full">
            <EmptyState icon={<Receipt className="size-5" />} title="Nenhuma nota fiscal encontrada" />
          </div>
        )}
      </div>
    </div>
  );
}
