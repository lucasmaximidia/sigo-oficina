"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
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
import { createItemMes } from "@/lib/pessoal-actions";
import type { PessoalItemSecao } from "@/types";
import { PESSOAL_SECAO_LABEL } from "@/lib/pessoal-status";

export function LancarItemMesDialog({
  mes,
  secao,
  triggerLabel,
  descricaoPadrao,
  valorPrevistoPadrao,
}: {
  mes: string;
  secao: PessoalItemSecao;
  triggerLabel?: string;
  descricaoPadrao?: string;
  valorPrevistoPadrao?: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    formData.set("mes", mes);
    formData.set("secao", secao);
    startTransition(async () => {
      try {
        await createItemMes(formData);
        toast.success("Item lançado");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao lançar item");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          <Plus className="size-4" />
          {triggerLabel ?? "Adicionar"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo item em {PESSOAL_SECAO_LABEL[secao]}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="descricao" className="mb-1.5 block">
              Descrição
            </Label>
            <Input
              id="descricao"
              name="descricao"
              required
              defaultValue={descricaoPadrao}
              placeholder="Ex: Água, Internet, Pedreiro..."
              className="uppercase"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valor_previsto" className="mb-1.5 block">
                Valor previsto (R$)
              </Label>
              <NumericInput id="valor_previsto" name="valor_previsto" required defaultValue={valorPrevistoPadrao} />
            </div>
            <div>
              <Label htmlFor="forma_pagamento" className="mb-1.5 block">
                Forma de pagamento
              </Label>
              <Input id="forma_pagamento" name="forma_pagamento" placeholder="Ex: PIX" className="uppercase" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Lançar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
