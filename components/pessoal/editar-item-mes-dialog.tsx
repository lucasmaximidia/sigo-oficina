"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateItemMes } from "@/lib/pessoal-actions";
import { calcularDizimo, salarioDoDizimo } from "@/lib/pessoal-status";
import { formatCurrency, hojeBR } from "@/lib/utils";
import type { PessoalItemMes, PessoalRenda } from "@/types";

export function EditarItemMesDialog({ item, renda }: { item: PessoalItemMes; renda: PessoalRenda[] }) {
  const [open, setOpen] = useState(false);
  const [valorPrevisto, setValorPrevisto] = useState(item.valor_previsto);
  const [valorReal, setValorReal] = useState(item.valor_real ?? 0);
  const [isPending, startTransition] = useTransition();

  // Dízimo não recalcula sozinho quando o salário muda (combinado com o
  // dono: só sugere, não trava) — aqui é onde dá pra puxar a sugestão
  // atualizada de 10% do salário pra corrigir um dízimo já confirmado.
  const salario = item.secao === "dizimo" ? salarioDoDizimo(renda, item.descricao) : null;
  const sugestaoPrevisto = salario ? calcularDizimo(salario.valor_previsto) : null;
  const sugestaoReal = salario?.valor_real != null ? calcularDizimo(salario.valor_real) : null;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setValorPrevisto(item.valor_previsto);
      setValorReal(item.valor_real ?? 0);
    }
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateItemMes(item.id, formData);
        toast.success("Item atualizado");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao atualizar item");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Editar item"
          className="-m-2 shrink-0 rounded-md p-2 text-muted-foreground hover:text-foreground"
        >
          <Pencil className="size-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar item</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="descricao" className="mb-1.5 block">
              Descrição
            </Label>
            <Input id="descricao" name="descricao" required defaultValue={item.descricao} className="uppercase" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valor_previsto" className="mb-1.5 flex items-center justify-between gap-2">
                <span>Valor previsto (R$)</span>
                {sugestaoPrevisto != null && sugestaoPrevisto !== valorPrevisto && (
                  <button
                    type="button"
                    onClick={() => setValorPrevisto(sugestaoPrevisto)}
                    className="text-xs font-normal text-primary hover:underline"
                  >
                    10% do salário: {formatCurrency(sugestaoPrevisto)}
                  </button>
                )}
              </Label>
              <NumericInput id="valor_previsto" name="valor_previsto" required value={valorPrevisto} onValueChange={setValorPrevisto} />
            </div>
            <div>
              <Label htmlFor="forma_pagamento" className="mb-1.5 block">
                Forma de pagamento
              </Label>
              <Input id="forma_pagamento" name="forma_pagamento" defaultValue={item.forma_pagamento ?? ""} className="uppercase" />
            </div>
          </div>
          {item.valor_real != null && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valor_real" className="mb-1.5 flex items-center justify-between gap-2">
                  <span>Valor pago (R$)</span>
                  {sugestaoReal != null && sugestaoReal !== valorReal && (
                    <button
                      type="button"
                      onClick={() => setValorReal(sugestaoReal)}
                      className="text-xs font-normal text-primary hover:underline"
                    >
                      10% do salário: {formatCurrency(sugestaoReal)}
                    </button>
                  )}
                </Label>
                <NumericInput id="valor_real" name="valor_real" required value={valorReal} onValueChange={setValorReal} />
              </div>
              <div>
                <Label htmlFor="pago_em" className="mb-1.5 block">
                  Data do pagamento
                </Label>
                <Input id="pago_em" name="pago_em" type="date" max={hojeBR()} defaultValue={item.pago_em ?? hojeBR()} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
