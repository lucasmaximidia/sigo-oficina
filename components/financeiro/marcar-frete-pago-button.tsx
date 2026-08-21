"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marcarFretePago } from "@/lib/actions";

export function MarcarFretePagoButton({ freteId, osId }: { freteId: string; osId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            await marcarFretePago(freteId, osId);
            toast.success("Frete marcado como pago");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao atualizar frete");
          }
        })
      }
    >
      <Check className="size-3.5" />
      Marcar pago
    </Button>
  );
}
