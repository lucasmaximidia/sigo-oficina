import Link from "next/link";
import { ShieldCheck, AlertTriangle, History, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { GarantiaCard } from "@/components/garantias/garantia-card";
import type { GarantiaStatus } from "@/types";

export const dynamic = "force-dynamic";

export default async function GarantiasPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const filtro = (params.filtro as GarantiaStatus | undefined) ?? "todas";

  const { data: garantias } = await supabase.from("vw_garantias").select("*").order("data_expiracao", { ascending: true });

  const ativas = (garantias ?? []).filter((g) => g.status_garantia === "ativa" || g.status_garantia === "critica");
  const criticas = (garantias ?? []).filter((g) => g.status_garantia === "critica");
  const expiradas = (garantias ?? []).filter((g) => g.status_garantia === "expirada");

  const filtradas =
    filtro === "todas"
      ? garantias ?? []
      : (garantias ?? []).filter((g) => g.status_garantia === filtro);

  const tabs: { value: string; label: string }[] = [
    { value: "todas", label: "Todas" },
    { value: "ativa", label: "Ativas" },
    { value: "critica", label: "Críticas" },
    { value: "expirada", label: "Expiradas" },
  ];

  return (
    <div>
      <PageHeader
        title="Garantias"
        description="Acompanhe o prazo de garantia dos serviços finalizados."
        actions={
          <Button asChild variant="outline">
            <Link href="/garantias/configuracoes">
              <Settings className="size-4" />
              Configurações
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
        <StatCard icon={ShieldCheck} label="Garantias Ativas" value={ativas.length} />
        <StatCard icon={AlertTriangle} label="Vencendo em < 15 dias" value={criticas.length} />
        <StatCard icon={History} label="Expiradas Recentes" value={expiradas.length} />
      </div>

      <div className="mt-5 mb-4 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/garantias?filtro=${tab.value}`}
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
        {filtradas.map((g) => (
          <GarantiaCard key={g.os_id} garantia={g} prazoTotal={g.garantia_dias} />
        ))}
        {filtradas.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">Nenhuma garantia encontrada.</p>
        )}
      </div>
    </div>
  );
}
