"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { marcarLancamentoRepassado } from "@/lib/pessoal-actions";
import { cn } from "@/lib/utils";

// Marca/desmarca um gasto de cartão por conta de terceiros como já
// repassado de volta — cada item tem o seu próprio botão, em vez de um
// único "recebi tudo" pro mês inteiro.
export function MarcarRepassadoButton({ id, repassado }: { id: string; repassado: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        await marcarLancamentoRepassado(id, !repassado);
        toast.success(repassado ? "Marcado como pendente" : "Marcado como recebido");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao atualizar");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={repassado ? "Marcar como ainda não recebido" : "Marcar como recebido"}
      aria-pressed={repassado}
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors disabled:opacity-50",
        repassado ? "border-success bg-success text-white" : "border-input text-transparent hover:border-success hover:text-success/40"
      )}
    >
      <Check className="size-3.5" />
    </button>
  );
}
