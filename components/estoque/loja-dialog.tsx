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
import { createLojaParceira } from "@/lib/actions";

export function LojaDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createLojaParceira(formData);
        toast.success("Loja parceira cadastrada");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao cadastrar loja");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start text-primary">
          <Plus className="size-4" />
          Nova loja parceira
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova loja parceira</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="nome" className="mb-1.5 block">
              Nome
            </Label>
            <Input id="nome" name="nome" required />
          </div>
          <div>
            <Label htmlFor="especialidade" className="mb-1.5 block">
              Especialidade
            </Label>
            <Input id="especialidade" name="especialidade" placeholder="Ex: Especialista em refrigeração" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefone" className="mb-1.5 block">
                Telefone
              </Label>
              <PhoneInput id="telefone" name="telefone" />
            </div>
            <div>
              <Label htmlFor="tempo_entrega" className="mb-1.5 block">
                Tempo de entrega
              </Label>
              <Input id="tempo_entrega" name="tempo_entrega" placeholder="Ex: Entrega em 24h" />
            </div>
          </div>
          <div>
            <Label htmlFor="desconto_percentual" className="mb-1.5 block">
              Desconto (%)
            </Label>
            <Input id="desconto_percentual" name="desconto_percentual" type="number" step="0.1" min={0} />
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
