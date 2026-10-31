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
import { updateLancamentoCartao } from "@/lib/pessoal-actions";
import { PESSOAL_CARTAO_CATEGORIA_LABEL } from "@/lib/pessoal-status";
import type { PessoalCartaoLancamento } from "@/types";

export function EditarLancamentoCartaoDialog({ lancamento }: { lancamento: PessoalCartaoLancamento }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateLancamentoCartao(lancamento.id, formData);
        toast.success("Lançamento atualizado");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao atualizar lançamento");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Editar lançamento"
          className="-m-2 shrink-0 rounded-md p-2 text-muted-foreground hover:text-foreground"
        >
          <Pencil className="size-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Editar lançamento{lancamento.parcela_total > 1 ? ` (${lancamento.parcela_atual}/${lancamento.parcela_total})` : ""}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="descricao" className="mb-1.5 block">
              Descrição
            </Label>
            <Input id="descricao" name="descricao" required defaultValue={lancamento.descricao} className="uppercase" />
          </div>
          <div>
            <Label className="mb-1.5 block">Categoria</Label>
            <Select name="categoria" defaultValue={lancamento.categoria}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PESSOAL_CARTAO_CATEGORIA_LABEL).map(([valor, label]) => (
                  <SelectItem key={valor} value={valor}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valor_previsto" className="mb-1.5 block">
                Valor previsto (R$)
              </Label>
              <NumericInput id="valor_previsto" name="valor_previsto" required defaultValue={lancamento.valor_previsto} />
            </div>
            {lancamento.valor_real != null && (
              <div>
                <Label htmlFor="valor_real" className="mb-1.5 block">
                  Valor real (R$)
                </Label>
                <NumericInput id="valor_real" name="valor_real" required defaultValue={lancamento.valor_real} />
              </div>
            )}
          </div>
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
