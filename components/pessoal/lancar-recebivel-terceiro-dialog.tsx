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
import { createRenda } from "@/lib/pessoal-actions";

// Recebível de terceiro que não vem de gasto no cartão — ex: a oficina
// pagando uma taxa de energia pra casa. Conta como renda "Terceiros" (não
// como salário, então não entra no cálculo do dízimo), mas é lançado aqui
// junto com o resto do que terceiros devem.
export function LancarRecebivelTerceiroDialog({ mes }: { mes: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    formData.set("mes", mes);
    formData.set("categoria", "terceiros");
    startTransition(async () => {
      try {
        await createRenda(formData);
        toast.success("Recebível lançado");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao lançar recebível");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          <Plus className="size-4" />
          Lançar recebível
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lançar recebível de terceiro</DialogTitle>
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
              placeholder="Ex: Taxa de energia - Oficina"
              className="uppercase"
            />
          </div>
          <div>
            <Label htmlFor="valor_previsto" className="mb-1.5 block">
              Valor (R$)
            </Label>
            <NumericInput id="valor_previsto" name="valor_previsto" required />
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
