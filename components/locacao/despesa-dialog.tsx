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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Textarea } from "@/components/ui/textarea";
import { createDespesa } from "@/lib/locacao-actions";
import type { LocacaoVeiculo } from "@/types";

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

export function DespesaDialog({ veiculos }: { veiculos: Pick<LocacaoVeiculo, "id" | "marca" | "modelo">[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createDespesa(formData);
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
        <Button type="button">
          <Plus className="size-4" />
          Nova Saída
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova saída</DialogTitle>
          <DialogDescription>Despesa da operação de locação (manutenção, compra, aluguel de ponto, etc.).</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data" className="mb-1.5 block">
                Data
              </Label>
              <Input id="data" name="data" type="date" defaultValue={hoje()} required />
            </div>
            <div>
              <Label htmlFor="valor" className="mb-1.5 block">
                Valor (R$)
              </Label>
              <NumericInput id="valor" name="valor" required />
            </div>
          </div>
          <div>
            <Label htmlFor="descricao" className="mb-1.5 block">
              Descrição
            </Label>
            <Input id="descricao" name="descricao" required placeholder="Ex: Troca de bateria" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoria" className="mb-1.5 block">
                Categoria
              </Label>
              <Input id="categoria" name="categoria" placeholder="Manutenção, Compra..." />
            </div>
            <div>
              <Label htmlFor="fornecedor" className="mb-1.5 block">
                Fornecedor
              </Label>
              <Input id="fornecedor" name="fornecedor" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Veículo (opcional)</Label>
              <Select name="veiculo_id" defaultValue="nenhum">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Nenhum</SelectItem>
                  {veiculos.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.marca} {v.modelo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="km" className="mb-1.5 block">
                KM na manutenção (opcional)
              </Label>
              <Input id="km" name="km" type="number" inputMode="numeric" placeholder="Ex: 1500" />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Forma de pagamento</Label>
            <Select name="forma_pagamento" defaultValue="pix">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="cartao">Cartão</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="observacoes" className="mb-1.5 block">
              Observações
            </Label>
            <Textarea id="observacoes" name="observacoes" rows={2} />
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
