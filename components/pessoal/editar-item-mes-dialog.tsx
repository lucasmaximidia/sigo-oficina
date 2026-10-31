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
import { hojeBR } from "@/lib/utils";
import type { PessoalItemMes } from "@/types";

export function EditarItemMesDialog({ item }: { item: PessoalItemMes }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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
    <Dialog open={open} onOpenChange={setOpen}>
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
              <Label htmlFor="valor_previsto" className="mb-1.5 block">
                Valor previsto (R$)
              </Label>
              <NumericInput id="valor_previsto" name="valor_previsto" required defaultValue={item.valor_previsto} />
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
                <Label htmlFor="valor_real" className="mb-1.5 block">
                  Valor pago (R$)
                </Label>
                <NumericInput id="valor_real" name="valor_real" required defaultValue={item.valor_real} />
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
