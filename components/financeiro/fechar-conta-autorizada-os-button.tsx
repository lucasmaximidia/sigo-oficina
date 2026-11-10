"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { fecharContaAutorizadaOs } from "@/lib/actions";
import { formatCurrency } from "@/lib/utils";

// Recebimento de uma OS só — pro caso de o pagamento da autorizada não vir
// em lote (ver FecharContaAutorizadaButton pra conta inteira da empresa).
export function FecharContaAutorizadaOsButton({ osId, osNumero, valor }: { osId: string; osNumero: number; valor: number }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await fecharContaAutorizadaOs(osId);
        toast.success("Recebimento registrado — entrada lançada no caixa");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao registrar recebimento");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          <HandCoins className="size-4" />
          Receber
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receber OS #OS-{String(osNumero).padStart(4, "0")}?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Marca só essa OS como paga (forma de pagamento &quot;Autorizada&quot;, {formatCurrency(valor)}) e ela passa
          a aparecer como entrada no Financeiro. As outras OS dessa empresa continuam pendentes.
        </p>
        <DialogFooter>
          <Button type="button" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Registrando..." : "Sim, já recebi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
