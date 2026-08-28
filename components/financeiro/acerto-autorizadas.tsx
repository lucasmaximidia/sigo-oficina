import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FecharContaAutorizadaButton } from "@/components/financeiro/fechar-conta-autorizada-button";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AutorizadaPendente } from "@/types";

export function AcertoAutorizadas({ autorizadas }: { autorizadas: AutorizadaPendente[] }) {
  if (autorizadas.length === 0) return null;

  return (
    <div className="mb-4 flex flex-col gap-3">
      {autorizadas.map((autorizada) => (
        <Card key={autorizada.empresaId}>
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-4.5 text-primary" />
                {autorizada.empresaNome}
              </CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {autorizada.itens.length} {autorizada.itens.length === 1 ? "OS finalizada" : "OS finalizadas"},
                aguardando pagamento em lote
              </p>
            </div>
            <FecharContaAutorizadaButton
              empresaAutorizadaId={autorizada.empresaId}
              empresaNome={autorizada.empresaNome}
              total={autorizada.total}
            />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {autorizada.itens.map((item) => (
              <div
                key={item.osId}
                className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg border border-border p-3 text-sm"
              >
                <span className="text-foreground">
                  OS #OS-{String(item.osNumero).padStart(4, "0")}
                  {item.dataFinalizacao && (
                    <span className="text-muted-foreground"> · {formatDate(item.dataFinalizacao)}</span>
                  )}
                </span>
                <span className="font-medium text-foreground">{formatCurrency(item.valor)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
