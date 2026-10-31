"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateRenda } from "@/lib/pessoal-actions";
import { PESSOAL_RENDA_CATEGORIA_LABEL } from "@/lib/pessoal-status";
import type { PessoalRenda } from "@/types";

export function EditarRendaDialog({ renda }: { renda: PessoalRenda }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateRenda(renda.id, formData);
        toast.success("Renda atualizada");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao atualizar renda");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Editar renda"
          className="-m-2 shrink-0 rounded-md p-2 text-muted-foreground hover:text-foreground"
        >
          <Pencil className="size-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar renda</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="descricao" className="mb-1.5 block">
              Descrição
            </Label>
            <Input id="descricao" name="descricao" required defaultValue={renda.descricao} className="uppercase" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Categoria</Label>
              <Select name="categoria" defaultValue={renda.categoria}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PESSOAL_RENDA_CATEGORIA_LABEL).map(([valor, label]) => (
                    <SelectItem key={valor} value={valor}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="valor_previsto" className="mb-1.5 block">
                Valor previsto (R$)
              </Label>
              <NumericInput id="valor_previsto" name="valor_previsto" required defaultValue={renda.valor_previsto} />
            </div>
          </div>
          {renda.valor_real != null && (
            <div>
              <Label htmlFor="valor_real" className="mb-1.5 block">
                Valor real (R$)
              </Label>
              <NumericInput id="valor_real" name="valor_real" required defaultValue={renda.valor_real} />
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
