import { TrendingUp } from "lucide-react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { PrevistoReal } from "@/components/pessoal/previsto-real";
import { LancarRendaDialog } from "@/components/pessoal/lancar-renda-dialog";
import { ConfirmarValorInline } from "@/components/pessoal/confirmar-valor-inline";
import { EditarRendaDialog } from "@/components/pessoal/editar-renda-dialog";
import { ExcluirRendaButton } from "@/components/pessoal/pessoal-excluir-buttons";
import { confirmarRenda } from "@/lib/pessoal-actions";
import { PESSOAL_RENDA_CATEGORIA_LABEL } from "@/lib/pessoal-status";
import { formatCurrency } from "@/lib/utils";
import type { PessoalRenda } from "@/types";

export function RendaSection({ renda, mes }: { renda: PessoalRenda[]; mes: string }) {
  const totalPrevisto = renda.reduce((acc, r) => acc + r.valor_previsto, 0);
  const totalReal = renda.reduce((acc, r) => acc + (r.valor_real ?? 0), 0);

  return (
    <CollapsibleCard
      id="renda"
      icon={<TrendingUp className="size-4.5 text-success" />}
      title="Renda do mês"
      meta={<PrevistoReal previsto={totalPrevisto} real={totalReal} />}
      actions={<LancarRendaDialog mes={mes} />}
    >
      {renda.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma renda lançada ainda.</p>
      ) : (
        renda.map((r) => (
          <div
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-lg border border-border p-3 text-sm"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate font-medium text-foreground">{r.descricao}</span>
              <span className="text-xs text-muted-foreground">
                {PESSOAL_RENDA_CATEGORIA_LABEL[r.categoria]} · Previsto {formatCurrency(r.valor_previsto)}
              </span>
            </div>
            <ConfirmarValorInline
              valorReal={r.valor_real}
              valorPrevisto={r.valor_previsto}
              onConfirm={confirmarRenda.bind(null, r.id)}
            />
            <EditarRendaDialog renda={r} />
            <ExcluirRendaButton id={r.id} descricao={r.descricao} />
          </div>
        ))
      )}
    </CollapsibleCard>
  );
}
