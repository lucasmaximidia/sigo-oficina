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
import { updateOsItem } from "@/lib/actions";
import type { OsItem } from "@/types";

export function EditarOsItemDialog({ osId, item }: { osId: string; item: OsItem }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateOsItem(item.id, osId, formData);
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
        <button type="button" className="text-muted-foreground hover:text-primary" aria-label="Editar item">
          <Pencil className="size-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar item</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="edit_item_descricao" className="mb-1.5 block">
              Descrição
            </Label>
            <Input id="edit_item_descricao" name="descricao" required defaultValue={item.descricao} className="uppercase" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit_item_quantidade" className="mb-1.5 block">
                Quantidade
              </Label>
              <NumericInput id="edit_item_quantidade" name="quantidade" decimal={false} defaultValue={item.quantidade} />
            </div>
            <div>
              <Label htmlFor="edit_item_valor_unitario" className="mb-1.5 block">
                {item.origem === "compra_emergencial" ? "Valor repassado ao cliente (R$)" : "Valor unitário (R$)"}
              </Label>
              <NumericInput id="edit_item_valor_unitario" name="valor_unitario" defaultValue={item.valor_unitario} />
            </div>
          </div>
          {item.origem === "compra_emergencial" && (
            <div>
              <Label htmlFor="edit_item_custo_unitario" className="mb-1.5 block">
                Custo unitário — o que você pagou (R$)
              </Label>
              <NumericInput id="edit_item_custo_unitario" name="custo_unitario" defaultValue={item.custo_unitario ?? 0} />
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
