"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
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
import { createCliente, updateCliente } from "@/lib/actions";
import type { Cliente } from "@/types";

export function ClienteFormDialog({ cliente }: { cliente?: Cliente }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isEdit = Boolean(cliente);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (cliente) {
          await updateCliente(cliente.id, formData);
          toast.success("Cliente atualizado");
          setOpen(false);
        } else {
          const id = await createCliente(formData);
          toast.success("Cliente cadastrado");
          setOpen(false);
          router.push(`/clientes?id=${id}`);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar cliente");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="outline" size="sm">
            <Pencil className="size-3.5" />
            Editar Cadastro
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" />
            Novo Cliente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar cliente" : "Novo cliente"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="nome" className="mb-1.5 block">
              Nome completo
            </Label>
            <Input id="nome" name="nome" required defaultValue={cliente?.nome} className="uppercase" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefone" className="mb-1.5 block">
                Telefone
              </Label>
              <PhoneInput id="telefone" name="telefone" defaultValue={cliente?.telefone ?? ""} />
            </div>
            <div>
              <Label htmlFor="cpf_cnpj" className="mb-1.5 block">
                CPF/CNPJ
              </Label>
              <Input id="cpf_cnpj" name="cpf_cnpj" defaultValue={cliente?.cpf_cnpj ?? ""} />
            </div>
          </div>
          <div>
            <Label htmlFor="email" className="mb-1.5 block">
              E-mail
            </Label>
            <Input id="email" name="email" type="email" defaultValue={cliente?.email ?? ""} />
          </div>
          <div>
            <Label htmlFor="endereco" className="mb-1.5 block">
              Endereço
            </Label>
            <Input id="endereco" name="endereco" defaultValue={cliente?.endereco ?? ""} className="uppercase" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bairro" className="mb-1.5 block">
                Bairro
              </Label>
              <Input id="bairro" name="bairro" defaultValue={cliente?.bairro ?? ""} className="uppercase" />
            </div>
            <div>
              <Label htmlFor="cidade" className="mb-1.5 block">
                Cidade
              </Label>
              <Input id="cidade" name="cidade" defaultValue={cliente?.cidade ?? ""} className="uppercase" />
            </div>
            <div>
              <Label htmlFor="estado" className="mb-1.5 block">
                UF
              </Label>
              <Input
                id="estado"
                name="estado"
                maxLength={2}
                defaultValue={cliente?.estado ?? ""}
                className="uppercase"
              />
            </div>
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
