"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { confirmarFaturaCartao } from "@/lib/pessoal-actions";

// Confirma de uma vez todos os lançamentos pendentes do cartão no mês,
// assumindo que vieram igual ao previsto — o atalho rápido pra "paguei o
// cartão, confirmo". O que vier diferente continua editável um a um.
export function FecharFaturaButton({ cartaoId, mes }: { cartaoId: string; mes: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        await confirmarFaturaCartao(cartaoId, mes);
        toast.success("Fatura confirmada");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao confirmar fatura");
      }
    });
  }

  return (
    <Button type="button" size="sm" onClick={handleClick} disabled={isPending}>
      <CheckCircle2 className="size-4" />
      {isPending ? "Confirmando..." : "Confirmar fatura"}
    </Button>
  );
}
