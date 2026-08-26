"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createRetirada } from "@/lib/actions";

export function LancarRetiradaDialog() {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState("mao_de_obra");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createRetirada(formData);
        toast.success("Retirada lançada");
        setOpen(false);
        setTipo("mao_de_obra");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao lançar retirada");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Nova Retirada
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lançar retirada do caixa</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label className="mb-1.5 block">Tipo</Label>
            <Select name="tipo" value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mao_de_obra">Retirada de Mão de Obra</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="descricao" className="mb-1.5 block">
              Descrição
            </Label>
            <Input
              id="descricao"
              name="descricao"
              required
              placeholder="Ex: Retirada mensal, pró-labore..."
              className="uppercase"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valor" className="mb-1.5 block">
                Valor (R$)
              </Label>
              <NumericInput id="valor" name="valor" required />
            </div>
            <div>
              <Label htmlFor="data" className="mb-1.5 block">
                Data
              </Label>
              <Input id="data" name="data" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Lançar retirada"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
