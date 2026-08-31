"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateAgendaStatus } from "@/lib/actions";

export function MarcarConcluidoButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            await updateAgendaStatus(id, "concluido");
            toast.success("Agendamento marcado como concluído");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao atualizar agendamento");
          }
        })
      }
    >
      <CheckCircle2 className="size-3.5" />
      Concluir
    </Button>
  );
}
