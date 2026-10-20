"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCliente, updateCliente } from "@/lib/locacao-actions";
import type { LocacaoCliente } from "@/types";

export function ClienteLocacaoDialog({ cliente }: { cliente?: LocacaoCliente }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const editando = !!cliente;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (editando) {
          await updateCliente(cliente.id, formData);
          toast.success("Cliente atualizado");
        } else {
          await createCliente(formData);
          toast.success("Cliente cadastrado");
        }
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar cliente");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editando ? (
          <button
            type="button"
            aria-label="Editar cliente"
            className="-m-2 shrink-0 rounded-md p-2 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="size-4" />
          </button>
        ) : (
          <Button type="button">
            <Plus className="size-4" />
            Novo Cliente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editando ? "Editar cliente" : "Novo cliente"}</DialogTitle>
          <DialogDescription>Cadastro de cliente da locação.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="nome" className="mb-1.5 block">
              Nome completo
            </Label>
            <Input id="nome" name="nome" required defaultValue={cliente?.nome ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cpf" className="mb-1.5 block">
                CPF
              </Label>
              <Input id="cpf" name="cpf" defaultValue={cliente?.cpf ?? ""} />
            </div>
            <div>
              <Label htmlFor="telefone" className="mb-1.5 block">
                Telefone
              </Label>
              <Input id="telefone" name="telefone" defaultValue={cliente?.telefone ?? ""} />
            </div>
          </div>
          <div>
            <Label htmlFor="observacoes" className="mb-1.5 block">
              Observações
            </Label>
            <Textarea id="observacoes" name="observacoes" rows={2} defaultValue={cliente?.observacoes ?? ""} />
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
