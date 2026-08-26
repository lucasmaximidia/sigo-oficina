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
import { fecharContaParceiro } from "@/lib/actions";
import { formatCurrency } from "@/lib/utils";

export function FecharContaParceiroButton({
  lojaParceiraId,
  lojaNome,
  total,
}: {
  lojaParceiraId: string;
  lojaNome: string;
  total: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await fecharContaParceiro(lojaParceiraId);
        toast.success("Conta fechada — retirada lançada no caixa");
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
          <DialogTitle>Fechar conta com {lojaNome}?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Isso lança uma retirada de {formatCurrency(total)} no caixa e marca todos os itens pendentes dessa loja
          como pagos. Use quando você já acertou com o parceiro.
        </p>
        <DialogFooter>
          <Button type="button" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Fechando..." : "Sim, já paguei"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
