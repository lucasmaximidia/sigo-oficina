"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { freteStatusMap, freteTipoMap } from "@/lib/status";
import { addFrete, marcarFretePago, deleteFrete } from "@/lib/actions";
import { PrestadorFreteDialog } from "./prestador-frete-dialog";
import type { Frete, FreteTipo, PrestadorFrete } from "@/types";

export function FreteCard({
  osId,
  fretes,
  prestadoresIniciais,
  valorCobrado,
}: {
  osId: string;
  fretes: Frete[];
  prestadoresIniciais: PrestadorFrete[];
  valorCobrado: number;
}) {
  const [prestadores, setPrestadores] = useState(prestadoresIniciais);
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<FreteTipo>("entrega");
  const [prestadorId, setPrestadorId] = useState("");
  const [valorCusto, setValorCusto] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [pagandoId, setPagandoId] = useState<string | null>(null);

  const totalCusto = fretes.reduce((acc, f) => acc + f.valor_custo, 0);
  const margem = valorCobrado - totalCusto;

  function handleAdicionar() {
    const formData = new FormData();
    if (prestadorId) formData.set("prestador_id", prestadorId);
    formData.set("valor_custo", String(valorCusto));
    formData.set("tipo", tipo);
    startTransition(async () => {
      try {
        await addFrete(osId, formData);
        toast.success("Frete adicionado");
        setOpen(false);
        setPrestadorId("");
        setValorCusto(0);
        setTipo("entrega");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao adicionar frete");
      }
    });
  }

  function handleMarcarPago(freteId: string) {
    setPagandoId(freteId);
    startTransition(async () => {
      try {
        await marcarFretePago(freteId, osId);
        toast.success("Frete marcado como pago");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao atualizar frete");
      } finally {
        setPagandoId(null);
      }
    });
  }

  function handleExcluir(freteId: string) {
    startDelete(async () => {
      try {
        await deleteFrete(freteId, osId);
        toast.success("Frete removido");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao remover frete");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Separe o quanto você paga a quem faz o frete do quanto cobra do cliente (esse último fica no campo
        &quot;Frete&quot; do Resumo de Valores). Cada busca ou entrega pode ser lançada e paga separadamente.
      </p>

      <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-sm">
        <span className="text-muted-foreground">Margem (cobrado - custo)</span>
        <span className={margem >= 0 ? "font-semibold text-success" : "font-semibold text-destructive"}>
          {formatCurrency(margem)}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {fretes.length === 0 && <p className="text-sm text-muted-foreground">Nenhum frete lançado ainda.</p>}
        {fretes.map((frete) => {
          const statusInfo = freteStatusMap[frete.status];
          const tipoInfo = freteTipoMap[frete.tipo];
          const prestador = prestadores.find((p) => p.id === frete.prestador_id);
          return (
            <div key={frete.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Badge variant={tipoInfo.variant}>{tipoInfo.label}</Badge>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </div>
                <p className="mt-1 text-sm font-medium text-foreground">{formatCurrency(frete.valor_custo)}</p>
                <p className="text-xs text-muted-foreground">
                  {prestador?.nome ?? "Sem prestador"}
                  {frete.status === "pago" && frete.data_pagamento &&
                    ` · Pago em ${new Date(`${frete.data_pagamento}T00:00:00`).toLocaleDateString("pt-BR")}`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {frete.status === "pendente" && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarcarPago(frete.id)}
                    disabled={isPending && pagandoId === frete.id}
                  >
                    <Check className="size-4" />
                    Marcar pago
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => handleExcluir(frete.id)}
                  disabled={isDeleting}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Remover frete"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="secondary">
            <Plus className="size-4" />
            Adicionar Frete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar frete</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <Label className="mb-1.5 block">Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as FreteTipo)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buscar">Buscar</SelectItem>
                  <SelectItem value="entrega">Entrega</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1.5 block">Prestador do frete</Label>
              <Select value={prestadorId} onValueChange={setPrestadorId}>
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
              <PrestadorFreteDialog
                onCreated={(id, nome) => {
                  setPrestadores((prev) => [...prev, { id, nome, telefone: null, created_at: new Date().toISOString() }]);
                  setPrestadorId(id);
                }}
              />
            </div>

            <div>
              <Label htmlFor="valor_custo_frete" className="mb-1.5 block">
                Valor pago ao prestador (R$)
              </Label>
              <NumericInput id="valor_custo_frete" defaultValue={0} onValueChange={setValorCusto} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleAdicionar} disabled={isPending}>
              {isPending ? "Adicionando..." : "Adicionar frete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
