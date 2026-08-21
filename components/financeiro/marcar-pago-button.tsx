"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marcarContaPaga } from "@/lib/actions";

export function MarcarPagoButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            await marcarContaPaga(id);
            toast.success("Conta marcada como paga");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao atualizar conta");
          }
        })
      }
    >
      <Check className="size-3.5" />
      Marcar paga
    </Button>
  );
}
