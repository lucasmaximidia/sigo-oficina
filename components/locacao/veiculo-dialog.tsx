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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Textarea } from "@/components/ui/textarea";
import { createVeiculo, updateVeiculo } from "@/lib/locacao-actions";
import type { LocacaoVeiculo } from "@/types";

export function VeiculoDialog({ veiculo }: { veiculo?: LocacaoVeiculo }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const editando = !!veiculo;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (editando) {
          await updateVeiculo(veiculo.id, formData);
          toast.success("Veículo atualizado");
        } else {
          await createVeiculo(formData);
          toast.success("Veículo cadastrado");
        }
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar veículo");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editando ? (
          <button
            type="button"
            aria-label="Editar veículo"
            className="-m-2 shrink-0 rounded-md p-2 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="size-4" />
          </button>
        ) : (
          <Button type="button">
            <Plus className="size-4" />
            Novo Veículo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="locacao-theme">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar veículo" : "Novo veículo"}</DialogTitle>
          <DialogDescription>Scooter ou bicicleta elétrica disponível para locação.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Tipo</Label>
              <Select name="tipo" defaultValue={veiculo?.tipo ?? "scooter"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="locacao-theme">
                  <SelectItem value="scooter">Scooter</SelectItem>
                  <SelectItem value="bicicleta">Bicicleta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cor" className="mb-1.5 block">
                Cor
              </Label>
              <Input id="cor" name="cor" defaultValue={veiculo?.cor ?? ""} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="marca" className="mb-1.5 block">
                Marca
              </Label>
              <Input id="marca" name="marca" required defaultValue={veiculo?.marca ?? ""} />
            </div>
            <div>
              <Label htmlFor="modelo" className="mb-1.5 block">
                Modelo
              </Label>
              <Input id="modelo" name="modelo" required defaultValue={veiculo?.modelo ?? ""} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="chassi" className="mb-1.5 block">
                Chassi
              </Label>
              <Input id="chassi" name="chassi" required defaultValue={veiculo?.chassi ?? ""} />
            </div>
            <div>
              <Label htmlFor="valor_diaria" className="mb-1.5 block">
                Diária padrão (R$)
              </Label>
              <NumericInput id="valor_diaria" name="valor_diaria" defaultValue={veiculo?.valor_diaria ?? undefined} />
            </div>
          </div>
          <div>
            <Label htmlFor="observacoes" className="mb-1.5 block">
              Observações
            </Label>
            <Textarea id="observacoes" name="observacoes" rows={2} defaultValue={veiculo?.observacoes ?? ""} />
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
