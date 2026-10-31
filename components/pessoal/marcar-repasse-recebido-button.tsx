"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marcarRepasseRecebido } from "@/lib/pessoal-actions";

export function MarcarRepasseRecebidoButton({ mes, valor }: { mes: string; valor: number }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        await marcarRepasseRecebido(mes, valor);
        toast.success("Repasse confirmado em Renda > Contas pagas por Terceiros");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao confirmar repasse");
      }
    });
  }

  return (
    <Button type="button" size="sm" className="w-full" onClick={handleClick} disabled={isPending}>
      <CheckCircle2 className="size-4" />
      {isPending ? "Confirmando..." : "Marcar como recebido"}
    </Button>
  );
}
