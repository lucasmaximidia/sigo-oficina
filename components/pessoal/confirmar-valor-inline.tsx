"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NumericInput } from "@/components/ui/numeric-input";
import { formatCurrency } from "@/lib/utils";

// Confirma o "valor real" de um lançamento simples (renda ou parcela de
// cartão) — sem data, só o valor. Enquanto não confirmado, mostra um
// input + botão; confirmado, mostra só o valor em destaque. É esse o
// "já sei o valor, confirmo" que o dono pediu.
export function ConfirmarValorInline({
  valorReal,
  valorPrevisto,
  onConfirm,
}: {
  valorReal: number | null;
  valorPrevisto: number;
  onConfirm: (valor: number) => Promise<void>;
}) {
  const [valor, setValor] = useState(valorPrevisto);
  const [isPending, startTransition] = useTransition();

  if (valorReal != null) {
    return <span className="text-sm font-semibold text-success">{formatCurrency(valorReal)}</span>;
  }

  function handleConfirm() {
    startTransition(async () => {
      try {
        await onConfirm(valor);
        toast.success("Confirmado");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao confirmar");
      }
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <NumericInput value={valor} onValueChange={setValor} className="h-8 w-24 text-sm" />
      <Button type="button" size="icon" variant="outline" className="size-8 shrink-0" disabled={isPending} onClick={handleConfirm}>
        <Check className="size-3.5" />
      </Button>
    </div>
  );
}
