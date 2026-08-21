"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Truck, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { freteStatusMap } from "@/lib/status";
import { upsertFrete, marcarFretePago } from "@/lib/actions";
import { PrestadorFreteDialog } from "./prestador-frete-dialog";
import type { Frete, PrestadorFrete } from "@/types";

export function FreteCard({
  osId,
  frete,
  prestadoresIniciais,
  valorCobrado,
}: {
  osId: string;
  frete: Frete | null;
  prestadoresIniciais: PrestadorFrete[];
  valorCobrado: number;
}) {
  const [prestadores, setPrestadores] = useState(prestadoresIniciais);
  const [prestadorId, setPrestadorId] = useState(frete?.prestador_id ?? "");
  const [valorCusto, setValorCusto] = useState(frete?.valor_custo ?? 0);
  const [isPending, startTransition] = useTransition();

  const status = frete?.status ?? "pendente";
  const statusInfo = freteStatusMap[status];
  const margem = valorCobrado - valorCusto;

  function handleSalvar() {
    const formData = new FormData();
    if (prestadorId) formData.set("prestador_id", prestadorId);
    formData.set("valor_custo", String(valorCusto));
    startTransition(async () => {
      try {
        await upsertFrete(osId, formData);
        toast.success("Frete salvo");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar frete");
      }
    });
  }

  function handleMarcarPago() {
    if (!frete) return;
    startTransition(async () => {
      try {
        await marcarFretePago(frete.id, osId);
        toast.success("Frete marcado como pago");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao atualizar frete");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Truck className="size-4 text-primary" />
          Custo do frete
        </p>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Separe o quanto você paga ao entregador do quanto cobra do cliente (esse último fica no campo &quot;Frete&quot;
        do Resumo de Valores).
      </p>

      <div>
        <Label className="mb-1.5 block">Prestador do frete</Label>
        <Select value={prestadorId} onValueChange={setPrestadorId} disabled={status === "pago"}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {prestadores.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {status !== "pago" && (
          <PrestadorFreteDialog
            onCreated={(id, nome) => {
              setPrestadores((prev) => [...prev, { id, nome, telefone: null, created_at: new Date().toISOString() }]);
              setPrestadorId(id);
            }}
          />
        )}
      </div>

      <div>
        <Label htmlFor="valor_custo_frete" className="mb-1.5 block">
          Valor pago ao prestador (R$)
        </Label>
        <NumericInput
          id="valor_custo_frete"
          defaultValue={frete?.valor_custo ?? 0}
          disabled={status === "pago"}
          onValueChange={setValorCusto}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-sm">
        <span className="text-muted-foreground">Margem (cobrado - custo)</span>
        <span className={margem >= 0 ? "font-semibold text-success" : "font-semibold text-destructive"}>
          {formatCurrency(margem)}
        </span>
      </div>

      {status === "pago" ? (
        <p className="text-xs text-muted-foreground">
          Pago em {frete?.data_pagamento ? new Date(`${frete.data_pagamento}T00:00:00`).toLocaleDateString("pt-BR") : "—"}
        </p>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" className="flex-1" onClick={handleSalvar} disabled={isPending}>
            Salvar
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleMarcarPago}
            disabled={isPending || !frete}
            title={!frete ? "Salve o frete primeiro" : undefined}
          >
            <Check className="size-4" />
            Marcar como pago
          </Button>
        </div>
      )}
    </div>
  );
}
