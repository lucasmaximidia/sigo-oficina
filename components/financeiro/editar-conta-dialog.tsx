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
import { updateContaPagar } from "@/lib/actions";
import type { FinanceiroConta } from "@/types";

export function EditarContaDialog({ conta }: { conta: FinanceiroConta }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateContaPagar(conta.id, formData);
        toast.success("Conta atualizada");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao atualizar conta");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="icon" variant="ghost" className="text-muted-foreground hover:text-primary" aria-label="Editar conta">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar conta</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="edit_descricao" className="mb-1.5 block">
              Descrição
            </Label>
            <Input
              id="edit_descricao"
              name="descricao"
              required
              defaultValue={conta.descricao}
              className="uppercase"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit_categoria" className="mb-1.5 block">
                Categoria
              </Label>
              <Input id="edit_categoria" name="categoria" defaultValue={conta.categoria ?? ""} className="uppercase" />
            </div>
            <div>
              <Label htmlFor="edit_fornecedor" className="mb-1.5 block">
                Fornecedor
              </Label>
              <Input id="edit_fornecedor" name="fornecedor" defaultValue={conta.fornecedor ?? ""} className="uppercase" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit_valor" className="mb-1.5 block">
                Valor (R$)
              </Label>
              <NumericInput id="edit_valor" name="valor" required defaultValue={conta.valor} />
            </div>
            <div>
              <Label htmlFor="edit_vencimento" className="mb-1.5 block">
                Vencimento
              </Label>
              <Input id="edit_vencimento" name="vencimento" type="date" required defaultValue={conta.vencimento} />
            </div>
          </div>
          <div>
            <Label htmlFor="edit_numero_documento" className="mb-1.5 block">
              Número do documento (opcional)
            </Label>
            <Input
              id="edit_numero_documento"
              name="numero_documento"
              defaultValue={conta.numero_documento ?? ""}
              className="uppercase"
            />
          </div>
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
