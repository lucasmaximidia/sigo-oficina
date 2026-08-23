"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createCliente } from "@/lib/actions";

export function NovoClienteDialog({ onCreated }: { onCreated: (id: string, nome: string) => void }) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const id = await createCliente(formData);
        toast.success("Cliente cadastrado");
        onCreated(id, nome.toUpperCase());
        setOpen(false);
        setNome("");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao cadastrar cliente");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="text-primary">
          <Plus className="size-4" />
          Novo cliente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo cliente</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="novo_cliente_nome" className="mb-1.5 block">
              Nome
            </Label>
            <Input
              id="novo_cliente_nome"
              name="nome"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="uppercase"
            />
          </div>
          <div>
            <Label htmlFor="novo_cliente_telefone" className="mb-1.5 block">
              Telefone
            </Label>
            <PhoneInput id="novo_cliente_telefone" name="telefone" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
