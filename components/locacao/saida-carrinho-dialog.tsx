"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
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
import { NumericInput } from "@/components/ui/numeric-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registrarSaidaCarrinho } from "@/lib/locacao-dispositivos-actions";

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

export function SaidaCarrinhoDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await registrarSaidaCarrinho(formData);
        toast.success("Saída registrada");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao registrar saída");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Plus className="size-3.5" />
          Nova saída
        </Button>
      </DialogTrigger>
      <DialogContent className="locacao-theme">
        <DialogHeader>
          <DialogTitle>Nova saída</DialogTitle>
          <DialogDescription>Despesa dos carrinhos (manutenção, peça, etc.) — entra no caixa da locação.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_saida" className="mb-1.5 block">
                Data
              </Label>
              <Input id="data_saida" name="data" type="date" defaultValue={hoje()} required />
            </div>
            <div>
              <Label htmlFor="valor_saida" className="mb-1.5 block">
                Valor (R$)
              </Label>
              <NumericInput id="valor_saida" name="valor" required />
            </div>
          </div>
          <div>
            <Label htmlFor="descricao_saida" className="mb-1.5 block">
              Descrição
            </Label>
            <Input id="descricao_saida" name="descricao" required placeholder="Ex: Troca de pneu do carrinho 1" />
          </div>
          <div>
            <Label className="mb-1.5 block">Forma de pagamento</Label>
            <Select name="forma_pagamento" defaultValue="dinheiro">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="locacao-theme">
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="cartao">Cartão</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Registrar saída"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
