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
import { createAjusteCaixa } from "@/lib/actions";

export function LancarAjusteCaixaDialog() {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState("entrada");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createAjusteCaixa(formData);
        toast.success("Ajuste lançado");
        setOpen(false);
        setTipo("entrada");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao lançar ajuste");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Novo Ajuste
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lançar ajuste de caixa</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Use isso para corrigir o Saldo em Caixa quando ele não bater com o caixa físico — por exemplo, o saldo
            que já existia antes de começar a usar o sistema.
          </p>
          <div>
            <Label className="mb-1.5 block">Tipo</Label>
            <Select name="tipo" value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Somar ao caixa</SelectItem>
                <SelectItem value="saida">Remover do caixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="ajuste_descricao" className="mb-1.5 block">
              Descrição
            </Label>
            <Input
              id="ajuste_descricao"
              name="descricao"
              required
              placeholder="Ex: Saldo em caixa antes do sistema"
              className="uppercase"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ajuste_valor" className="mb-1.5 block">
                Valor (R$)
              </Label>
              <NumericInput id="ajuste_valor" name="valor" required />
            </div>
            <div>
              <Label htmlFor="ajuste_data" className="mb-1.5 block">
                Data
              </Label>
              <Input id="ajuste_data" name="data" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Lançar ajuste"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
