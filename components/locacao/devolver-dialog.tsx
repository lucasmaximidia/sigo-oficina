"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { registrarDevolucao } from "@/lib/locacao-actions";

export function DevolverDialog({
  aluguelId,
  veiculoId,
  open,
  onOpenChange,
}: {
  aluguelId: string;
  veiculoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();

  function confirmar(status: "disponivel" | "manutencao") {
    startTransition(async () => {
      try {
        await registrarDevolucao(aluguelId, veiculoId, status);
        toast.success("Devolução registrada");
        onOpenChange(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao registrar devolução");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar devolução</DialogTitle>
          <DialogDescription>Em que condição o veículo foi devolvido?</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => confirmar("manutencao")}
            className="gap-2"
          >
            <Wrench className="size-4" />
            Precisa de manutenção
          </Button>
          <Button type="button" disabled={isPending} onClick={() => confirmar("disponivel")} className="gap-2">
            <CheckCircle2 className="size-4" />
            Está em boas condições
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
