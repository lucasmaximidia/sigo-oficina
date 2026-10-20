"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { marcarAluguelPago } from "@/lib/locacao-actions";

export function RegistrarPagamentoDialog({ aluguelId, valor }: { aluguelId: string; valor: number }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const valorPago = parseFloat(String(formData.get("valor_pago") ?? "0").replace(",", ".")) || 0;
        await marcarAluguelPago(aluguelId, valorPago);
        toast.success("Pagamento registrado");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao registrar pagamento");
      }
    });
  }

  return (
    <>
      <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={() => setOpen(true)}>
        <CircleDollarSign className="size-3.5" />
        Registrar pagamento
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="locacao-theme">
        <DialogHeader>
          <DialogTitle>Registrar pagamento</DialogTitle>
          <DialogDescription>Confirme o valor recebido por este aluguel.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="valor_pago" className="mb-1.5 block">
              Valor pago (R$)
            </Label>
            <NumericInput id="valor_pago" name="valor_pago" defaultValue={valor} required />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      </Dialog>
    </>
  );
}
