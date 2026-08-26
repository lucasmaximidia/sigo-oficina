"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { updateOrdemServicoValores } from "@/lib/actions";
import type { OrdemServico } from "@/types";

export function OsResumoValores({ os, totalPecas }: { os: OrdemServico; totalPecas: number }) {
  const [maoObra, setMaoObra] = useState(os.valor_mao_obra);
  const [frete, setFrete] = useState(os.valor_frete);
  const [desconto, setDesconto] = useState(os.desconto);
  const [isPending, startTransition] = useTransition();

  const total = totalPecas + maoObra + frete - desconto;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateOrdemServicoValores(os.id, formData);
        toast.success("Valores atualizados");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar valores");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3.5">
      <div>
        <Label htmlFor="valor_mao_obra" className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">
          Mão de Obra (R$)
        </Label>
        <NumericInput id="valor_mao_obra" name="valor_mao_obra" defaultValue={os.valor_mao_obra} onValueChange={setMaoObra} />
      </div>
      <div>
        <Label htmlFor="valor_frete" className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">
          Frete / Deslocamento (R$)
        </Label>
        <NumericInput id="valor_frete" name="valor_frete" defaultValue={os.valor_frete} onValueChange={setFrete} />
      </div>
      <div>
        <Label htmlFor="desconto" className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">
          Desconto (R$)
        </Label>
        <NumericInput id="desconto" name="desconto" defaultValue={os.desconto} onValueChange={setDesconto} />
      </div>

      <input type="hidden" name="diagnostico" value={os.diagnostico ?? ""} />

      <div className="flex flex-col gap-1.5 border-t border-border pt-3 text-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Peças e Materiais:</span>
          <span>{formatCurrency(totalPecas)}</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Mão de Obra:</span>
          <span>{formatCurrency(maoObra)}</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Frete:</span>
          <span>{formatCurrency(frete)}</span>
        </div>
        <div className="flex items-center justify-between text-destructive">
          <span>Desconto:</span>
          <span>- {formatCurrency(desconto)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-sm font-semibold text-foreground">Total</span>
        <span className="text-xl font-bold text-primary">{formatCurrency(Math.max(0, total))}</span>
      </div>

      <Button type="submit" disabled={isPending} className="mt-1">
        {isPending ? "Salvando..." : "Salvar Alterações"}
      </Button>
    </form>
  );
}
