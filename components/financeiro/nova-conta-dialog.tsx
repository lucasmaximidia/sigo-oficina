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
import { createContaPagar } from "@/lib/actions";

export function NovaContaDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createContaPagar(formData);
        toast.success("Conta cadastrada");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao cadastrar conta");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Plus className="size-4" />
          Nova Conta / Boleto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova conta a pagar</DialogTitle>
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
              placeholder="Ex: Fornecedor EletroPeças LTDA"
              className="uppercase"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoria" className="mb-1.5 block">
                Categoria
              </Label>
              <Input id="categoria" name="categoria" placeholder="Ex: Peças, Aluguel..." className="uppercase" />
            </div>
            <div>
              <Label htmlFor="fornecedor" className="mb-1.5 block">
                Fornecedor
              </Label>
              <Input id="fornecedor" name="fornecedor" className="uppercase" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valor" className="mb-1.5 block">
                Valor da parcela (R$)
              </Label>
              <NumericInput id="valor" name="valor" required />
            </div>
            <div>
              <Label htmlFor="vencimento" className="mb-1.5 block">
                1º vencimento
              </Label>
              <Input id="vencimento" name="vencimento" type="date" required />
            </div>
          </div>
          <div>
            <Label htmlFor="parcelas" className="mb-1.5 block">
              Parcelas
            </Label>
            <NumericInput id="parcelas" name="parcelas" decimal={false} defaultValue={1} />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Se for mais de 1, cria uma conta por parcela automaticamente, mesmo valor, vencendo a cada mês a partir
              da data acima.
            </p>
          </div>
          <div>
            <Label htmlFor="numero_documento" className="mb-1.5 block">
              Número do documento (opcional)
            </Label>
            <Input
              id="numero_documento"
              name="numero_documento"
              placeholder="Ex: Boleto Nfe #1209"
              className="uppercase"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Cadastrar conta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
