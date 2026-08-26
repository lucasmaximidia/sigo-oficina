"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
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
import { createLojaParceira, updateLojaParceira } from "@/lib/actions";
import type { LojaParceira } from "@/types";

export function LojaDialog({ loja }: { loja?: LojaParceira }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(loja);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (loja) {
          await updateLojaParceira(loja.id, formData);
          toast.success("Loja parceira atualizada");
        } else {
          await createLojaParceira(formData);
          toast.success("Loja parceira cadastrada");
        }
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar loja");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button type="button" variant="ghost" size="icon" aria-label="Editar loja parceira">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="w-full justify-start text-primary">
            <Plus className="size-4" />
            Nova loja parceira
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar loja parceira" : "Nova loja parceira"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="nome" className="mb-1.5 block">
              Nome
            </Label>
            <Input id="nome" name="nome" required defaultValue={loja?.nome} className="uppercase" />
          </div>
          <div>
            <Label htmlFor="especialidade" className="mb-1.5 block">
              Especialidade
            </Label>
            <Input
              id="especialidade"
              name="especialidade"
              placeholder="Ex: Especialista em refrigeração"
              defaultValue={loja?.especialidade ?? ""}
              className="uppercase"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefone" className="mb-1.5 block">
                Telefone
              </Label>
              <PhoneInput id="telefone" name="telefone" defaultValue={loja?.telefone ?? ""} />
            </div>
            <div>
              <Label htmlFor="cnpj" className="mb-1.5 block">
                CNPJ (opcional)
              </Label>
              <Input id="cnpj" name="cnpj" defaultValue={loja?.cnpj ?? ""} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tempo_entrega" className="mb-1.5 block">
                Tempo de entrega
              </Label>
              <Input
                id="tempo_entrega"
                name="tempo_entrega"
                placeholder="Ex: Entrega em 24h"
                defaultValue={loja?.tempo_entrega ?? ""}
                className="uppercase"
              />
            </div>
            <div>
              <Label htmlFor="desconto_percentual" className="mb-1.5 block">
                Desconto (%)
              </Label>
              <NumericInput id="desconto_percentual" name="desconto_percentual" defaultValue={loja?.desconto_percentual ?? 0} />
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
