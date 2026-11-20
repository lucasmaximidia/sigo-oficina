"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Wallet } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { lancarCarrinhosNoCaixa } from "@/lib/locacao-dispositivos-actions";
import { formatCurrency } from "@/lib/utils";

const FORMA_LABEL: Record<string, string> = {
  pix: "PIX",
  cartao: "Cartão",
  dinheiro: "Dinheiro",
  transferencia: "Transferência",
};

export function LancarCaixaDialog({
  periodoInicio,
  periodoFim,
  carrinhoFiltro,
  carrinhos,
}: {
  periodoInicio: string;
  periodoFim: string;
  carrinhoFiltro: string;
  carrinhos: { id: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const r = await lancarCarrinhosNoCaixa(formData);
        toast.success(`Lançado no caixa: ${formatCurrency(r.valor)} (${r.quantidade} aluguel(éis))`);
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao lançar no caixa");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <Wallet className="size-4" />
          Lançar no caixa
        </Button>
      </DialogTrigger>
      <DialogContent className="locacao-theme">
        <DialogHeader>
          <DialogTitle>Lançar carrinhos no caixa</DialogTitle>
          <DialogDescription>
            Cria uma entrada no financeiro com a soma das sessões ainda sem lançamento no período escolhido.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="dispositivo_id" value={carrinhoFiltro === "todos" ? "" : carrinhoFiltro} />
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Label htmlFor="periodo_inicio" className="mb-1.5 block">
                De
              </Label>
              <Input id="periodo_inicio" name="periodo_inicio" type="date" defaultValue={periodoInicio} required />
            </div>
            <div className="flex-1">
              <Label htmlFor="periodo_fim" className="mb-1.5 block">
                Até
              </Label>
              <Input id="periodo_fim" name="periodo_fim" type="date" defaultValue={periodoFim} required />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Forma de pagamento</Label>
            <Select name="forma_pagamento" defaultValue="pix" required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="locacao-theme">
                {Object.entries(FORMA_LABEL).map(([valor, label]) => (
                  <SelectItem key={valor} value={valor}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            {carrinhoFiltro === "todos"
              ? "Considera todos os carrinhos."
              : `Só o ${carrinhos.find((c) => c.id === carrinhoFiltro)?.label ?? "carrinho selecionado"}.`}
          </p>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Lançando..." : "Lançar no caixa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
