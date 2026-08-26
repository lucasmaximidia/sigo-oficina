"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Wallet2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { formaPagamentoLabel } from "@/lib/relatorio-financeiro";
import { registrarPagamentoOs, deleteOsPagamento } from "@/lib/actions";
import type { FormaPagamento, OsPagamento, TipoCartao } from "@/types";

const tipoCartaoLabel: Record<string, string> = { debito: "Débito", credito: "Crédito" };

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

export function OsPagamentos({ osId, total, pagamentos }: { osId: string; total: number; pagamentos: OsPagamento[] }) {
  const [open, setOpen] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("pix");
  const [tipoCartao, setTipoCartao] = useState<TipoCartao>("debito");
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  const totalPago = pagamentos.reduce((acc, p) => acc + p.valor, 0);
  const saldoDevedor = Math.max(0, total - totalPago);
  const quitado = saldoDevedor < 0.01 && total > 0;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const valor = parseFloat(String(formData.get("valor") ?? "0").replace(",", "."));
        const isCartao = formaPagamento === "cartao";
        await registrarPagamentoOs(osId, {
          formaPagamento,
          valor,
          data: String(formData.get("data") ?? hoje()),
          tipoCartao: isCartao ? tipoCartao : null,
          valorRecebidoLiquido: isCartao
            ? parseFloat(String(formData.get("valor_recebido_liquido") ?? valor).replace(",", "."))
            : null,
        });
        toast.success("Pagamento registrado");
        setOpen(false);
        setFormaPagamento("pix");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao registrar pagamento");
      }
    });
  }

  function handleDelete(id: string) {
    startDelete(async () => {
      try {
        await deleteOsPagamento(id, osId);
        toast.success("Pagamento removido");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao remover pagamento");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{formatCurrency(totalPago)} pago de {formatCurrency(total)}</p>
          <p className="text-xs text-muted-foreground">
            {quitado ? "Total quitado" : totalPago > 0 ? `Falta ${formatCurrency(saldoDevedor)}` : "Nenhum pagamento registrado"}
          </p>
        </div>
        <Badge variant={quitado ? "success" : totalPago > 0 ? "warning" : "secondary"}>
          {quitado ? "Quitado" : totalPago > 0 ? "Parcial" : "Pendente"}
        </Badge>
      </div>

      <div className="flex flex-col gap-2">
        {pagamentos.length === 0 && <p className="text-sm text-muted-foreground">Nenhum pagamento registrado ainda.</p>}
        {pagamentos.map((pagamento) => (
          <div key={pagamento.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{formatCurrency(pagamento.valor)}</p>
              <p className="text-xs text-muted-foreground">
                {formaPagamentoLabel[pagamento.forma_pagamento] ?? pagamento.forma_pagamento} · {formatDate(pagamento.data)}
                {pagamento.tipo_cartao && ` · ${tipoCartaoLabel[pagamento.tipo_cartao] ?? pagamento.tipo_cartao}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(pagamento.id)}
              disabled={isDeleting}
              className="shrink-0 text-muted-foreground hover:text-destructive"
              aria-label="Remover pagamento"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="secondary">
            <Plus className="size-4" />
            Registrar Pagamento
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar pagamento</DialogTitle>
          </DialogHeader>
          <form action={handleSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Use isso pra lançar um sinal, um pagamento parcial ou a quitação — a qualquer momento, mesmo antes de
              finalizar a OS.
            </p>
            <div>
              <Label className="mb-1.5 block">Forma de pagamento</Label>
              <Select value={formaPagamento} onValueChange={(v) => setFormaPagamento(v as FormaPagamento)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valor" className="mb-1.5 block">
                  Valor (R$)
                </Label>
                <NumericInput id="valor" name="valor" required defaultValue={saldoDevedor > 0 ? saldoDevedor : total} />
              </div>
              <div>
                <Label htmlFor="data" className="mb-1.5 block">
                  Data
                </Label>
                <Input id="data" name="data" type="date" defaultValue={hoje()} max={hoje()} />
              </div>
            </div>

            {formaPagamento === "cartao" && (
              <div className="flex flex-col gap-4 rounded-xl border border-border bg-secondary/50 p-3.5">
                <div>
                  <Label className="mb-1.5 block">Tipo de cartão</Label>
                  <Select value={tipoCartao} onValueChange={(v) => setTipoCartao(v as TipoCartao)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debito">Débito</SelectItem>
                      <SelectItem value="credito">Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="valor_recebido_liquido" className="mb-1.5 block">
                    Valor que entrou no caixa (R$)
                  </Label>
                  <NumericInput id="valor_recebido_liquido" name="valor_recebido_liquido" defaultValue={saldoDevedor > 0 ? saldoDevedor : total} />
                </div>
                <p className="text-xs text-muted-foreground">
                  A diferença entre o valor pago e o que entrou é a taxa da maquininha.
                </p>
              </div>
            )}

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                <Wallet2 className="size-4" />
                {isPending ? "Salvando..." : "Registrar pagamento"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
