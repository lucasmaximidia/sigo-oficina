"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
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
import { NumericInput } from "@/components/ui/numeric-input";
import { Checkbox } from "@/components/ui/checkbox";
import { confirmarItemMes } from "@/lib/pessoal-actions";
import { hojeBR } from "@/lib/utils";

export function ConfirmarItemMesDialog({
  id,
  descricao,
  valorPrevisto,
  valorAtual,
  valorSugerido,
  triggerLabel,
}: {
  id: string;
  descricao: string;
  valorPrevisto: number;
  /** Valor real já registrado (item confirmado mas ainda não pago) — vira o ponto de partida ao reabrir pra marcar como pago. */
  valorAtual?: number;
  /** Ex.: 10% do salário real já confirmado, pro dízimo — some quando não houver sugestão melhor que o previsto. */
  valorSugerido?: number;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [valor, setValor] = useState(valorSugerido ?? valorAtual ?? valorPrevisto);
  const [pago, setPago] = useState(true);
  const [dataPagamento, setDataPagamento] = useState(hojeBR());
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setValor(valorSugerido ?? valorAtual ?? valorPrevisto);
      setPago(true);
      setDataPagamento(hojeBR());
    }
  }

  function handleConfirm() {
    startTransition(async () => {
      try {
        await confirmarItemMes(id, valor, pago ? dataPagamento : null);
        toast.success(pago ? "Confirmado como pago" : "Valor registrado");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao confirmar");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          <CheckCircle2 className="size-4" />
          {triggerLabel ?? "Confirmar pago"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar valor — {descricao}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="valor_real" className="mb-1.5 block">
              Valor real (R$)
            </Label>
            <NumericInput id="valor_real" value={valor} onValueChange={setValor} />
          </div>
          <label className="flex items-center gap-2.5 text-sm font-medium text-foreground">
            <Checkbox checked={pago} onCheckedChange={(v) => setPago(v === true)} />
            Já foi pago
          </label>
          {pago && (
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
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Salvando..." : pago ? "Confirmar pago" : "Salvar valor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
