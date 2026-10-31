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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { fecharContaParceiro } from "@/lib/actions";
import { formatCurrency, hojeBR } from "@/lib/utils";

export function FecharContaParceiroButton({
  lojaParceiraId,
  lojaNome,
  itemIds,
  total,
}: {
  lojaParceiraId: string;
  lojaNome: string;
  itemIds: string[];
  total: number;
}) {
  const [open, setOpen] = useState(false);
  const [dataPagamento, setDataPagamento] = useState(hojeBR());
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await fecharContaParceiro(lojaParceiraId, itemIds, dataPagamento);
        toast.success("Conta fechada — retirada lançada no caixa");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao fechar conta");
      }
    });
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setDataPagamento(hojeBR());
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
          Isso lança uma retirada de {formatCurrency(total)} no caixa e marca esses itens como pagos. Use quando você
          já acertou com o parceiro.
        </p>
        <div>
          <Label htmlFor="data_pagamento" className="mb-1.5 block">
            Data do pagamento
          </Label>
          <Input
            id="data_pagamento"
            type="date"
            max={hojeBR()}
            value={dataPagamento}
            onChange={(e) => setDataPagamento(e.target.value)}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Esqueceu de dar baixa na hora certa? Ajuste aqui pra data real em que você pagou.
          </p>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Fechando..." : "Sim, já paguei"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
