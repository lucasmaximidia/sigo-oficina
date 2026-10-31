"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";
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
import { fecharFaturaCartao } from "@/lib/actions";
import { formatCurrency, hojeBR } from "@/lib/utils";

export function FecharFaturaCartaoButton({ despesaIds, total }: { despesaIds: string[]; total: number }) {
  const [open, setOpen] = useState(false);
  const [dataPagamento, setDataPagamento] = useState(hojeBR());
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await fecharFaturaCartao(despesaIds, dataPagamento);
        toast.success("Fatura fechada — retirada lançada no caixa");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao fechar fatura");
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
          <CreditCard className="size-4" />
          Fechar fatura — {formatCurrency(total)}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fechar a fatura do cartão?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Isso lança uma retirada de {formatCurrency(total)} no caixa e marca essas despesas como fechadas. Use
          quando a fatura do cartão já foi paga.
        </p>
        <div>
          <Label htmlFor="data_pagamento_fatura" className="mb-1.5 block">
            Data do pagamento
          </Label>
          <Input
            id="data_pagamento_fatura"
            type="date"
            max={hojeBR()}
            value={dataPagamento}
            onChange={(e) => setDataPagamento(e.target.value)}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Esqueceu de dar baixa na hora certa? Ajuste aqui pra data real em que a fatura foi paga.
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
