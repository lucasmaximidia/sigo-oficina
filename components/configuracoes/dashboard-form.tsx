"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateConfiguracoesDashboard } from "@/lib/actions";
import type { Configuracao } from "@/types";

export function DashboardForm({ config }: { config: Configuracao }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateConfiguracoesDashboard(formData);
        toast.success("Configurações do dashboard salvas");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayoutGrid className="size-4.5 text-primary" />
          Dashboard
        </CardTitle>
        <p className="text-xs text-muted-foreground">Controle o que aparece na Visão Geral.</p>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <label className="flex items-center gap-2.5">
            <Checkbox name="dashboard_mostrar_stats" defaultChecked={config.dashboard_mostrar_stats} />
            <span className="text-sm text-foreground">Cards de estatísticas (topo)</span>
          </label>
          <label className="flex items-center gap-2.5">
            <Checkbox name="dashboard_mostrar_agenda" defaultChecked={config.dashboard_mostrar_agenda} />
            <span className="text-sm text-foreground">Agenda do dia</span>
          </label>
          <label className="flex items-center gap-2.5">
            <Checkbox name="dashboard_mostrar_os_paradas" defaultChecked={config.dashboard_mostrar_os_paradas} />
            <span className="text-sm text-foreground">Alerta de OS paradas</span>
          </label>
          <label className="flex items-center gap-2.5">
            <Checkbox
              name="dashboard_mostrar_boletos_pendentes"
              defaultChecked={config.dashboard_mostrar_boletos_pendentes}
            />
            <span className="text-sm text-foreground">Lembrete de boletos pendentes</span>
          </label>
          <label className="flex items-center gap-2.5">
            <Checkbox name="dashboard_mostrar_tarefas" defaultChecked={config.dashboard_mostrar_tarefas} />
            <span className="text-sm text-foreground">Lista &quot;O que fazer hoje&quot;</span>
          </label>

          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cards extras</p>
          <label className="flex items-center gap-2.5">
            <Checkbox name="dashboard_mostrar_pdv_hoje" defaultChecked={config.dashboard_mostrar_pdv_hoje} />
            <span className="text-sm text-foreground">Vendas do PDV hoje</span>
          </label>
          <label className="flex items-center gap-2.5">
            <Checkbox name="dashboard_mostrar_fretes_pendentes" defaultChecked={config.dashboard_mostrar_fretes_pendentes} />
            <span className="text-sm text-foreground">Fretes pendentes de pagamento</span>
          </label>
          <label className="flex items-center gap-2.5">
            <Checkbox name="dashboard_mostrar_garantias_vencendo" defaultChecked={config.dashboard_mostrar_garantias_vencendo} />
            <span className="text-sm text-foreground">Garantias vencendo em breve</span>
          </label>
          <label className="flex items-center gap-2.5">
            <Checkbox name="dashboard_mostrar_orcamentos_pendentes" defaultChecked={config.dashboard_mostrar_orcamentos_pendentes} />
            <span className="text-sm text-foreground">Orçamentos aguardando resposta</span>
          </label>

          <div className="max-w-xs">
            <Label htmlFor="dashboard_os_parada_dias" className="mb-1.5 block">
              Alertar OS parada após quantos dias sem atualização
            </Label>
            <NumericInput
              id="dashboard_os_parada_dias"
              name="dashboard_os_parada_dias"
              decimal={false}
              defaultValue={config.dashboard_os_parada_dias}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Além das OS marcadas manualmente como paradas, qualquer OS em aberto sem nenhuma atualização por esse
              número de dias também entra no alerta.
            </p>
          </div>

          <div className="max-w-xs">
            <Label htmlFor="dashboard_boletos_dias" className="mb-1.5 block">
              Avisar boletos que vencem em até quantos dias
            </Label>
            <NumericInput
              id="dashboard_boletos_dias"
              name="dashboard_boletos_dias"
              decimal={false}
              defaultValue={config.dashboard_boletos_dias}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              O lembrete de boletos pendentes mostra os já atrasados mais os que vencem dentro desse número de dias.
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
