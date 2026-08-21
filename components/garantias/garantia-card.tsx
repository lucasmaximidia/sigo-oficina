import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Boxes } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { garantiaStatusMap } from "@/lib/status";
import type { VwGarantia } from "@/types";

export function GarantiaCard({ garantia, prazoTotal }: { garantia: VwGarantia; prazoTotal: number }) {
  const status = garantiaStatusMap[garantia.status_garantia];
  const progresso = Math.min(100, Math.max(0, (garantia.dias_restantes / (garantia.garantia_dias || prazoTotal)) * 100));

  return (
    <Link href={`/ordens-servico/${garantia.os_id}`}>
      <Card
        className={
          garantia.status_garantia === "critica"
            ? "border-warning/40 bg-warning/5 p-4"
            : "p-4 hover:border-primary/30"
        }
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-primary">
              <Boxes className="size-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">OS #{String(garantia.numero).padStart(5, "0")}</p>
              <p className="text-xs text-muted-foreground">{garantia.equipamento_tipo ?? "Equipamento"}</p>
            </div>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        <div className="mt-3 flex flex-col gap-0.5 text-xs text-muted-foreground">
          <p>
            Cliente <span className="font-medium text-foreground">{garantia.cliente_nome}</span>
          </p>
          <p>
            Data Finalização <span className="font-medium text-foreground">{formatDate(garantia.data_finalizacao)}</span>
          </p>
        </div>

        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">
              {garantia.dias_restantes > 0 ? `${garantia.dias_restantes} dias restantes` : "Expirou"}
            </span>
            <span className="text-muted-foreground">de {garantia.garantia_dias} dias</span>
          </div>
          <Progress
            value={progresso}
            indicatorClassName={
              garantia.status_garantia === "critica"
                ? "bg-warning"
                : garantia.status_garantia === "expirada"
                  ? "bg-destructive"
                  : "bg-success"
            }
          />
        </div>
      </Card>
    </Link>
  );
}
