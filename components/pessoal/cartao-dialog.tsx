"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createCartao, updateCartao } from "@/lib/pessoal-actions";
import type { PessoalCartao } from "@/types";

export function CartaoDialog({ cartao }: { cartao?: PessoalCartao }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const editando = !!cartao;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (editando) {
          await updateCartao(cartao.id, formData);
          toast.success("Cartão atualizado");
        } else {
          await createCartao(formData);
          toast.success("Cartão cadastrado");
        }
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar cartão");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editando ? (
          <button type="button" aria-label="Editar cartão" className="-m-2 shrink-0 rounded-md p-2 text-muted-foreground hover:text-foreground">
            <Pencil className="size-4" />
          </button>
        ) : (
          <Button type="button" size="sm">
            <Plus className="size-4" />
            Novo cartão
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editando ? "Editar cartão" : "Novo cartão"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="nome" className="mb-1.5 block">
              Nome
            </Label>
            <Input id="nome" name="nome" required placeholder="Ex: Cartão Inter Lucas - 8506" defaultValue={cartao?.nome ?? ""} className="uppercase" />
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
