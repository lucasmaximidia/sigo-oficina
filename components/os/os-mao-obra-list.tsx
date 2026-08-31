"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
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
import { formatCurrency } from "@/lib/utils";
import { addOsMaoObraItem, removeOsMaoObraItem } from "@/lib/actions";
import type { OsMaoObraItem } from "@/types";

export function OsMaoObraList({ osId, itens }: { osId: string; itens: OsMaoObraItem[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  const total = itens.reduce((acc, i) => acc + i.valor, 0);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await addOsMaoObraItem(osId, formData);
        toast.success("Mão de obra adicionada");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao adicionar mão de obra");
      }
    });
  }

  function handleRemove(itemId: string) {
    startDelete(async () => {
      try {
        await removeOsMaoObraItem(itemId, osId);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao remover mão de obra");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Mão de obra descrita</p>
          <p className="text-xs text-muted-foreground">
            Use isso quando quiser detalhar o serviço realizado — aparece na OS e na garantia. Sem itens aqui, o
            campo &quot;Mão de Obra&quot; do Financeiro segue livre para digitar um valor único, sem descrição.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" size="sm" variant="secondary" className="shrink-0">
              <Plus className="size-4" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar mão de obra</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="flex flex-col gap-4">
              <div>
                <Label htmlFor="mao_obra_descricao" className="mb-1.5 block">
                  Descrição do serviço
                </Label>
                <Input
                  id="mao_obra_descricao"
                  name="descricao"
                  required
                  placeholder="Ex: Troca do compressor, diagnóstico..."
                  className="uppercase"
                />
              </div>
              <div>
                <Label htmlFor="mao_obra_valor" className="mb-1.5 block">
                  Valor (R$)
                </Label>
                <NumericInput id="mao_obra_valor" name="valor" required defaultValue={0} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Adicionando..." : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {itens.length > 0 && (
        <div className="flex flex-col gap-2">
          {itens.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{item.descricao}</p>
              <div className="flex shrink-0 items-center gap-3">
                <p className="text-sm font-semibold text-foreground">{formatCurrency(item.valor)}</p>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  disabled={isDeleting}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Remover mão de obra"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between pt-1">
            <p className="text-sm font-medium text-muted-foreground">Total em mão de obra descrita</p>
            <p className="text-sm font-bold text-foreground">{formatCurrency(total)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
