"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { restaurarContaPagar, restaurarDespesa, restaurarRetirada, restaurarVendaPdv } from "@/lib/actions";

const restaurarPorTipo = {
  conta: restaurarContaPagar,
  despesa: restaurarDespesa,
  venda: restaurarVendaPdv,
  retirada: restaurarRetirada,
} as const;

export function RestaurarButton({ id, tipo }: { id: string; tipo: keyof typeof restaurarPorTipo }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        await restaurarPorTipo[tipo](id);
        toast.success("Restaurado");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao restaurar");
      }
    });
  }

  return (
    <Button type="button" size="sm" variant="secondary" onClick={handleClick} disabled={isPending}>
      <RotateCcw className="size-4" />
      {isPending ? "Restaurando..." : "Restaurar"}
    </Button>
  );
}
