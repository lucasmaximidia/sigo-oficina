"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { HandCoins } from "lucide-react";
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
import { registrarPrestacaoContasCarrinhos } from "@/lib/locacao-dispositivos-actions";
import { formatCurrency, formatDate } from "@/lib/utils";

const FORMA_LABEL: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  cartao: "Cartão",
  transferencia: "Transferência",
};

export function PrestacaoContasDialog({
  dia,
  valorPendente,
  diariasExistentes,
}: {
  dia: string;
  valorPendente: number;
  diariasExistentes: { descricao: string; valor: number }[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const r = await registrarPrestacaoContasCarrinhos(formData);
        const partes = [];
        if (r.valorRecebido > 0) partes.push(`${formatCurrency(r.valorRecebido)} lançado no caixa`);
        if (r.diariaValor > 0) partes.push(`${formatCurrency(r.diariaValor)} de diária registrada`);
        toast.success(partes.join(" · ") || "Registrado");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao registrar prestação de contas");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm">
          <HandCoins className="size-3.5" />
          Prestação de contas
        </Button>
      </DialogTrigger>
      <DialogContent className="locacao-theme">
        <DialogHeader>
          <DialogTitle>Prestação de contas — {formatDate(dia)}</DialogTitle>
          <DialogDescription>Lança o valor do dia no caixa e registra a diária do funcionário.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="dia" value={dia} />

          {valorPendente > 0 ? (
            <p className="text-sm">
              Valor a receber: <span className="font-semibold">{formatCurrency(valorPendente)}</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">O valor desse dia já foi lançado no caixa.</p>
          )}

          <div>
            <Label className="mb-1.5 block">Forma de pagamento</Label>
            <Select name="forma_pagamento" defaultValue="dinheiro">
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

          <div className="rounded-lg border border-border p-3">
            <p className="mb-2 text-sm font-semibold">Diária do funcionário</p>
            {diariasExistentes.length > 0 && (
              <ul className="mb-2 flex flex-col gap-0.5 text-xs text-muted-foreground">
                {diariasExistentes.map((d, i) => (
                  <li key={i}>
                    Já registrada: {d.descricao} — {formatCurrency(d.valor)}
                  </li>
                ))}
              </ul>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="funcionario_nome" className="mb-1.5 block">
                  Nome
                </Label>
                <Input id="funcionario_nome" name="funcionario_nome" placeholder="Opcional" />
              </div>
              <div>
                <Label htmlFor="diaria_valor" className="mb-1.5 block">
                  Valor da diária
                </Label>
                <NumericInput id="diaria_valor" name="diaria_valor" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Registrando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
