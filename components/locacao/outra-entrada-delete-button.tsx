"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteOutraEntrada } from "@/lib/locacao-actions";

export function OutraEntradaDeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label="Excluir entrada"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            await deleteOutraEntrada(id);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao excluir entrada");
          }
        })
      }
      className="-m-2 shrink-0 rounded-md p-2 text-muted-foreground hover:text-destructive disabled:opacity-50"
    >
      <Trash2 className="size-4" />
    </button>
  );
}
