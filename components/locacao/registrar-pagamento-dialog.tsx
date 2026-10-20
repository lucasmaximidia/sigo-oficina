"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CircleDollarSign, Trash2, Wallet2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { registrarPagamentoAluguel, deletePagamentoAluguel } from "@/lib/locacao-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { LocacaoAluguelPagamento, LocacaoFormaPagamento } from "@/types";

const FORMA_LABEL: Record<LocacaoFormaPagamento, string> = {
  pix: "PIX",
  cartao: "Cartão",
  dinheiro: "Dinheiro",
  transferencia: "Transferência",
};

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

export function RegistrarPagamentoDialog({
  aluguelId,
  valorTotal,
  pagamentos,
}: {
  aluguelId: string;
  valorTotal: number;
  pagamentos: LocacaoAluguelPagamento[];
}) {
  const [open, setOpen] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState<LocacaoFormaPagamento>("pix");
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  const totalPago = pagamentos.reduce((acc, p) => acc + p.valor, 0);
  const saldoDevedor = Math.max(0, valorTotal - totalPago);
  const quitado = saldoDevedor < 0.01 && valorTotal > 0;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const valor = parseFloat(String(formData.get("valor") ?? "0").replace(",", "."));
        await registrarPagamentoAluguel(aluguelId, {
          formaPagamento,
          valor,
          data: String(formData.get("data") ?? hoje()),
        });
        toast.success("Pagamento registrado");
        setFormaPagamento("pix");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao registrar pagamento");
      }
    });
  }

  function handleDelete(id: string) {
    startDelete(async () => {
      try {
        await deletePagamentoAluguel(id, aluguelId);
        toast.success("Pagamento removido");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao remover pagamento");
      }
    });
  }

  return (
    <>
      <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={() => setOpen(true)}>
        <CircleDollarSign className="size-3.5" />
        Pagamento
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="locacao-theme">
          <DialogHeader>
            <DialogTitle>Pagamentos do aluguel</DialogTitle>
            <DialogDescription>
              Registre conforme o cliente for pagando — à vista ou em partes, em datas diferentes.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {formatCurrency(totalPago)} pago de {formatCurrency(valorTotal)}
              </p>
              <p className="text-xs text-muted-foreground">
                {quitado ? "Total quitado" : totalPago > 0 ? `Falta ${formatCurrency(saldoDevedor)}` : "Nenhum pagamento registrado"}
              </p>
            </div>
            <Badge variant={quitado ? "success" : totalPago > 0 ? "warning" : "secondary"}>
              {quitado ? "Pago" : totalPago > 0 ? "Parcial" : "Pendente"}
            </Badge>
          </div>

          <div className="flex max-h-44 flex-col gap-2 overflow-y-auto">
            {pagamentos.length === 0 && <p className="text-sm text-muted-foreground">Nenhum pagamento registrado ainda.</p>}
            {pagamentos.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{formatCurrency(p.valor)}</p>
                  <p className="text-xs text-muted-foreground">
                    {FORMA_LABEL[p.forma_pagamento] ?? p.forma_pagamento} · {formatDate(p.data)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  disabled={isDeleting}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label="Remover pagamento"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>

          {!quitado && (
            <form action={handleSubmit} className="flex flex-col gap-4 border-t border-border pt-4">
              <div>
                <Label className="mb-1.5 block">Forma de pagamento</Label>
                <Select value={formaPagamento} onValueChange={(v) => setFormaPagamento(v as LocacaoFormaPagamento)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="locacao-theme">
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valor" className="mb-1.5 block">
                    Valor (R$)
                  </Label>
                  <NumericInput id="valor" name="valor" required defaultValue={saldoDevedor > 0 ? saldoDevedor : valorTotal} />
                </div>
                <div>
                  <Label htmlFor="data" className="mb-1.5 block">
                    Data
                  </Label>
                  <Input id="data" name="data" type="date" defaultValue={hoje()} max={hoje()} />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  <Wallet2 className="size-4" />
                  {isPending ? "Salvando..." : "Registrar pagamento"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
