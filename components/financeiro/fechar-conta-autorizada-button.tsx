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
import { fecharContaAutorizada } from "@/lib/actions";
import { formatCurrency } from "@/lib/utils";

export function FecharContaAutorizadaButton({
  empresaAutorizadaId,
  empresaNome,
  total,
}: {
  empresaAutorizadaId: string;
  empresaNome: string;
  total: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await fecharContaAutorizada(empresaAutorizadaId);
        toast.success("Conta fechada — entrada lançada no caixa");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao fechar conta");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm">
          <HandCoins className="size-4" />
          Fechar conta — {formatCurrency(total)}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fechar conta com {empresaNome}?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Isso marca todas as OS pendentes dessa empresa como pagas (forma de pagamento &quot;Autorizada&quot;) e
          elas passam a aparecer como entrada no Financeiro. Use quando o pagamento em lote já caiu.
        </p>
        <DialogFooter>
          <Button type="button" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Fechando..." : "Sim, já recebi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
