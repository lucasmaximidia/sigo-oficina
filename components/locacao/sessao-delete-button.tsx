"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2, Lock } from "lucide-react";
import { apagarSessaoCarrinho } from "@/lib/locacao-dispositivos-actions";

export function SessaoDeleteButton({ id, lancado }: { id: string; lancado: boolean }) {
  const [isPending, startTransition] = useTransition();

  if (lancado) {
    return (
      <span title="Já lançado no caixa — não pode ser apagado individualmente" className="inline-flex shrink-0 p-2 text-muted-foreground/40">
        <Lock className="size-4" />
      </span>
    );
  }

  function apagar() {
    if (!window.confirm("Apagar este aluguel do histórico? Essa ação não pode ser desfeita.")) return;
    startTransition(async () => {
      try {
        await apagarSessaoCarrinho(id);
        toast.success("Aluguel apagado");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao apagar aluguel");
      }
    });
  }

  return (
    <button
      type="button"
      aria-label="Apagar aluguel"
      disabled={isPending}
      onClick={apagar}
      className="-m-2 shrink-0 rounded-md p-2 text-muted-foreground hover:text-destructive disabled:opacity-50"
    >
      <Trash2 className="size-4" />
    </button>
  );
}
