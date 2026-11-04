"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { marcarFaturaPaga, desmarcarFaturaPaga } from "@/lib/pessoal-actions";
import { formatDate } from "@/lib/utils";

export function MarcarFaturaPagaButton({
  cartaoId,
  mes,
  pagoEm,
}: {
  cartaoId: string;
  mes: string;
  pagoEm: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  function marcar() {
    startTransition(async () => {
      try {
        await marcarFaturaPaga(cartaoId, mes);
        toast.success("Fatura marcada como paga");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao marcar fatura");
      }
    });
  }

  function desmarcar() {
    startTransition(async () => {
      try {
        await desmarcarFaturaPaga(cartaoId, mes);
        toast.success("Desmarcado");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao desmarcar fatura");
      }
    });
  }

  if (pagoEm) {
    return (
      <div className="flex items-center gap-1.5">
        <Badge variant="success">Paga em {formatDate(pagoEm)}</Badge>
        <button
          type="button"
          aria-label="Desmarcar fatura paga"
          onClick={desmarcar}
          disabled={isPending}
          className="-m-1.5 rounded-md p-1.5 text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <Button type="button" size="sm" variant="outline" onClick={marcar} disabled={isPending}>
      <Check className="size-3.5" />
      Fatura paga
    </Button>
  );
}
