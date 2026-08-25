"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { osStatusSteps } from "@/lib/status";
import { updateOrdemServicoStatus } from "@/lib/actions";
import { formatCurrency, cn } from "@/lib/utils";
import type { OsStatus, OsUrgencia } from "@/types";

export interface OsKanbanItem {
  id: string;
  numero: number;
  status: OsStatus;
  urgencia: OsUrgencia;
  total: number;
  clienteNome: string;
  equipamentoDescricao: string;
  dataLabel: string;
}

const DOT_CLASS: Record<OsUrgencia, string> = {
  alta: "bg-destructive",
  media: "bg-warning",
  baixa: "bg-muted-foreground/40",
};

const COLUNA_DOT: Record<OsStatus, string> = {
  aguardando_orcamento: "bg-muted-foreground/60",
  aguardando_pecas: "bg-warning",
  em_execucao: "bg-info",
  aguardando_pagamento: "bg-warning",
  finalizado: "bg-success",
  cancelado: "bg-destructive",
};

export function OsKanbanBoard({ ordens }: { ordens: OsKanbanItem[] }) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<OsStatus | null>(null);
  const [, startTransition] = useTransition();

  function handleDrop(status: OsStatus) {
    setDragOverStatus(null);
    const id = draggingId;
    setDraggingId(null);
    if (!id) return;
    const atual = ordens.find((o) => o.id === id);
    if (!atual || atual.status === status) return;
    startTransition(async () => {
      try {
        await updateOrdemServicoStatus(id, status);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao mover OS");
      }
    });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {osStatusSteps.map((step) => {
        const itens = ordens.filter((o) => o.status === step.value);
        const emDrag = dragOverStatus === step.value;
        return (
          <div key={step.value} className="w-[248px] shrink-0">
            <div className="mb-2.5 flex items-center gap-2 px-0.5">
              <span className={cn("size-2 rounded-full", COLUNA_DOT[step.value])} />
              <p className="text-xs font-bold text-foreground">{step.label}</p>
              <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-secondary-foreground">
                {itens.length}
              </span>
            </div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStatus(step.value);
              }}
              onDragLeave={() => setDragOverStatus((s) => (s === step.value ? null : s))}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(step.value);
              }}
              className={cn(
                "flex min-h-[420px] flex-col gap-2.5 rounded-2xl bg-secondary/70 p-2.5 transition-colors duration-150",
                emDrag && "bg-accent ring-2 ring-primary/40"
              )}
            >
              {itens.map((os) => (
                <Link
                  key={os.id}
                  href={`/ordens-servico/${os.id}`}
                  draggable
                  onDragStart={(e) => {
                    setDraggingId(os.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => setDraggingId(null)}
                  className={cn(
                    "flex cursor-grab flex-col gap-1.5 rounded-xl border border-border bg-card p-3 shadow-sm transition-[transform,box-shadow,opacity] duration-150 hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing",
                    draggingId === os.id && "opacity-40"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-bold text-foreground">#OS-{String(os.numero).padStart(4, "0")}</span>
                    <span className={cn("size-1.75 shrink-0 rounded-full", DOT_CLASS[os.urgencia])} />
                  </div>
                  <p className="truncate text-[13px] font-semibold text-foreground">{os.clienteNome}</p>
                  <p className="truncate text-xs text-muted-foreground">{os.equipamentoDescricao}</p>
                  <div className="mt-0.5 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">{os.dataLabel}</span>
                    <span className="text-[13px] font-bold text-primary">{formatCurrency(os.total)}</span>
                  </div>
                </Link>
              ))}
              {itens.length === 0 && (
                <p className="px-1 py-4 text-center text-xs text-muted-foreground">Nenhuma OS aqui</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
