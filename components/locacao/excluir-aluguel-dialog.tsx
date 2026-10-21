"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { deleteAluguel } from "@/lib/locacao-actions";

export function ExcluirAluguelDialog({
  aluguelId,
  numero,
  clienteNome,
  valorPago,
  emAberto,
}: {
  aluguelId: string;
  numero: number;
  clienteNome: string;
  valorPago: number;
  emAberto: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleExcluir() {
    startTransition(async () => {
      try {
        await deleteAluguel(aluguelId);
        toast.success("Aluguel excluído");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao excluir aluguel");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="icon" title="Excluir aluguel" className="text-destructive hover:text-destructive">
          <Trash2 className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="locacao-theme">
        <DialogHeader>
          <DialogTitle>Excluir aluguel #{String(numero).padStart(4, "0")}?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Essa ação não pode ser desfeita. O aluguel de <span className="font-medium text-foreground">{clienteNome}</span>
          {valorPago > 0 && (
            <>
              {" "}
              e os pagamentos já registrados (<span className="font-medium text-foreground">{formatCurrency(valorPago)}</span>)
            </>
          )}{" "}
          serão apagados.
          {emAberto && " O veículo volta a ficar disponível pra alugar."}
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
