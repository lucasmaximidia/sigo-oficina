"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteVeiculo } from "@/lib/locacao-actions";

export function ExcluirVeiculoDialog({ veiculoId, nome }: { veiculoId: string; nome: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleExcluir() {
    startTransition(async () => {
      try {
        await deleteVeiculo(veiculoId);
        toast.success("Veículo excluído");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao excluir veículo");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Excluir veículo"
          className="-m-2 shrink-0 rounded-md p-2 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="locacao-theme">
        <DialogHeader>
          <DialogTitle>Excluir {nome}?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Essa ação não pode ser desfeita. Só é possível excluir um veículo sem nenhum aluguel registrado — se já teve
          algum aluguel (mesmo encerrado), a exclusão será bloqueada.
        </p>
        <DialogFooter>
          <Button type="button" variant="destructive" onClick={handleExcluir} disabled={isPending}>
            {isPending ? "Excluindo..." : "Sim, excluir definitivamente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
