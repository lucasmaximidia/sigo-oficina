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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createEquipamento, updateEquipamento } from "@/lib/actions";
import type { Equipamento } from "@/types";

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

export function EquipamentoDialog({
  clienteId,
  equipamento,
  osId,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  hideTrigger = false,
}: {
  clienteId?: string;
  equipamento?: Pick<Equipamento, "id" | "tipo" | "marca" | "modelo" | "numero_serie">;
  osId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChangeProp ?? setOpenState;
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(equipamento);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (equipamento) {
          if (!osId) throw new Error("osId é obrigatório para editar o equipamento");
          await updateEquipamento(equipamento.id, osId, formData);
          toast.success("Equipamento atualizado");
        } else {
          if (!clienteId) throw new Error("clienteId é obrigatório para cadastrar o equipamento");
          await createEquipamento(clienteId, formData);
          toast.success("Equipamento adicionado");
        }
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar equipamento");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          {isEdit ? (
            <Button size="icon" variant="ghost" aria-label="Editar equipamento">
              <Pencil className="size-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="text-primary">
              <Plus className="size-4" />
              Novo Equipamento
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar equipamento" : "Novo equipamento"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label className="mb-1.5 block">Tipo</Label>
            <Select name="tipo" required defaultValue={equipamento?.tipo}>
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
              <Input id="marca" name="marca" defaultValue={equipamento?.marca ?? ""} className="uppercase" />
            </div>
            <div>
              <Label htmlFor="modelo" className="mb-1.5 block">
                Modelo
              </Label>
              <Input id="modelo" name="modelo" defaultValue={equipamento?.modelo ?? ""} className="uppercase" />
            </div>
          </div>
          <div>
            <Label htmlFor="numero_serie" className="mb-1.5 block">
              Número de série
            </Label>
            <Input
              id="numero_serie"
              name="numero_serie"
              defaultValue={equipamento?.numero_serie ?? ""}
              className="uppercase"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : isEdit ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
