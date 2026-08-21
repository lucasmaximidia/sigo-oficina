"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createEquipamento } from "@/lib/actions";

const tipos = [
  "Máquina de Lavar",
  "Lava e Seca",
  "Lava Louça",
  "Geladeira / Refrigerador",
  "Ar Condicionado",
  "Forno",
  "Bomba d'Água",
  "Outro",
];

export function EquipamentoDialog({ clienteId }: { clienteId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createEquipamento(clienteId, formData);
        toast.success("Equipamento adicionado");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao adicionar equipamento");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-primary">
          <Plus className="size-4" />
          Novo Equipamento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo equipamento</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label className="mb-1.5 block">Tipo</Label>
            <Select name="tipo" required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {tipos.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="marca" className="mb-1.5 block">
                Marca
              </Label>
              <Input id="marca" name="marca" />
            </div>
            <div>
              <Label htmlFor="modelo" className="mb-1.5 block">
                Modelo
              </Label>
              <Input id="modelo" name="modelo" />
            </div>
          </div>
          <div>
            <Label htmlFor="numero_serie" className="mb-1.5 block">
              Número de série
            </Label>
            <Input id="numero_serie" name="numero_serie" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
