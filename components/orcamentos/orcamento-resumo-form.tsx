"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { updateOrcamentoDetalhes } from "@/lib/actions";
import type { Orcamento } from "@/types";

export function OrcamentoResumoForm({ orcamento, totalItens }: { orcamento: Orcamento; totalItens: number }) {
  const [desconto, setDesconto] = useState(orcamento.desconto);
  const [isPending, startTransition] = useTransition();

  const total = Math.max(0, totalItens - desconto);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateOrcamentoDetalhes(orcamento.id, formData);
        toast.success("Orçamento atualizado");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3.5">
      <div>
        <Label htmlFor="data_validade" className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">
          Válido até
        </Label>
        <Input id="data_validade" name="data_validade" type="date" defaultValue={orcamento.data_validade} />
      </div>
      <div>
        <Label htmlFor="desconto" className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">
          Desconto (R$)
        </Label>
        <Input
          id="desconto"
          name="desconto"
          type="number"
          step="0.01"
          min={0}
          value={desconto}
          onChange={(e) => setDesconto(Number(e.target.value) || 0)}
        />
      </div>
      <div>
        <Label htmlFor="observacoes" className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">
          Observações (aparecem no PDF)
        </Label>
        <Textarea id="observacoes" name="observacoes" rows={3} defaultValue={orcamento.observacoes ?? ""} />
      </div>
      <input type="hidden" name="descricao" value={orcamento.descricao ?? ""} />

      <div className="flex flex-col gap-1.5 border-t border-border pt-3 text-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Itens:</span>
          <span>{formatCurrency(totalItens)}</span>
        </div>
        <div className="flex items-center justify-between text-destructive">
          <span>Desconto:</span>
          <span>- {formatCurrency(desconto)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-sm font-semibold text-foreground">Total</span>
        <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
      </div>

      <Button type="submit" disabled={isPending} className="mt-1">
        {isPending ? "Salvando..." : "Salvar Alterações"}
      </Button>
    </form>
  );
}
