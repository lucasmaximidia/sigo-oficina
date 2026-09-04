"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
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
  aguardandoRepasseAutorizada: boolean;
  empresaAutorizadaNome: string | null;
}

const DOT_CLASS: Record<OsUrgencia, string> = {
  alta: "bg-destructive",
  media: "bg-warning",
  baixa: "bg-muted-foreground/40",
};

const URGENCIA_WASH: Record<OsUrgencia, string> = {
  alta: "bg-destructive/5",
  media: "bg-warning/5",
  baixa: "bg-card",
};

interface Coluna {
  key: string;
  label: string;
  dotClass: string;
  // Status para onde a OS vai ao ser solta aqui — null bloqueia o drop
  // (colunas que só recebem OS automaticamente, nunca por arraste).
  dropStatus: OsStatus | null;
  match: (os: OsKanbanItem) => boolean;
}

const COLUNAS: Coluna[] = [
  {
    key: "aguardando_orcamento",
    label: "Aguardando Orçamento",
    dotClass: "bg-muted-foreground/60",
    dropStatus: "aguardando_orcamento",
    match: (os) => os.status === "aguardando_orcamento",
  },
  {
    key: "aguardando_pecas",
    label: "Aguardando Peças",
    dotClass: "bg-warning",
    dropStatus: "aguardando_pecas",
    match: (os) => os.status === "aguardando_pecas",
  },
  {
    key: "em_execucao",
    label: "Em Execução",
    dotClass: "bg-info",
    dropStatus: "em_execucao",
    match: (os) => os.status === "em_execucao",
  },
  {
    key: "aguardando_pagamento",
    label: "Pagamento",
    dotClass: "bg-warning",
    dropStatus: "aguardando_pagamento",
    match: (os) => os.status === "aguardando_pagamento",
  },
  {
    key: "finalizado",
    label: "Finalizado",
    dotClass: "bg-success",
    dropStatus: "finalizado",
    match: (os) => os.status === "finalizado" && !os.aguardandoRepasseAutorizada,
  },
  {
    key: "autorizadas",
    label: "Autorizadas",
    dotClass: "bg-info",
    dropStatus: null,
    match: (os) => os.aguardandoRepasseAutorizada,
  },
];

export function OsKanbanBoard({ ordens }: { ordens: OsKanbanItem[] }) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleDrop(coluna: Coluna) {
    setDragOverKey(null);
    const id = draggingId;
    setDraggingId(null);
    if (!id) return;
    const atual = ordens.find((o) => o.id === id);
    if (!atual) return;
    if (coluna.dropStatus === null) {
      toast.error("OS de autorizada cai aqui sozinha ao ser finalizada — o repasse é acertado no Financeiro.");
      return;
    }
    if (atual.status === coluna.dropStatus) return;
    if (coluna.dropStatus === "finalizado") {
      toast.error('Para finalizar, abra a OS e use "Finalizar Ordem" — é preciso informar a forma de pagamento.');
      return;
    }
    startTransition(async () => {
      try {
        await updateOrdemServicoStatus(id, coluna.dropStatus as OsStatus);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao mover OS");
      }
    });
  }

  return (
    <div className="flex h-full gap-3 overflow-x-auto pb-2">
      {COLUNAS.map((coluna) => {
        const itens = ordens.filter(coluna.match);
        const emDrag = dragOverKey === coluna.key;
        return (
          <div key={coluna.key} className="flex h-full min-w-[190px] flex-1 flex-col lg:min-w-[210px]">
            <div className="mb-2.5 flex shrink-0 items-center gap-2 px-0.5">
              <span className={cn("size-2 rounded-full", coluna.dotClass)} />
              <p className="text-xs font-bold text-foreground">{coluna.label}</p>
              <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-secondary-foreground">
                {itens.length}
              </span>
            </div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverKey(coluna.key);
              }}
              onDragLeave={() => setDragOverKey((k) => (k === coluna.key ? null : k))}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(coluna);
              }}
              className={cn(
                "flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto rounded-2xl bg-secondary/70 p-2.5 transition-colors duration-150",
                emDrag && "bg-accent ring-2 ring-primary/40"
              )}
            >
              {itens.map((os) => {
                const encerrada = os.status === "finalizado" || os.status === "cancelado";
                return (
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
                      "flex cursor-grab flex-col gap-1.5 rounded-xl border border-border p-3 shadow-sm transition-[transform,box-shadow,opacity] duration-150 hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing",
                      encerrada ? "bg-card" : URGENCIA_WASH[os.urgencia],
                      draggingId === os.id && "opacity-40"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-bold text-foreground">#OS-{String(os.numero).padStart(4, "0")}</span>
                      <span className={cn("size-1.75 shrink-0 rounded-full", DOT_CLASS[os.urgencia])} />
                    </div>
                    <p className="truncate text-[13px] font-semibold text-foreground">{os.clienteNome}</p>
                    <p className="truncate text-xs text-muted-foreground">{os.equipamentoDescricao}</p>
                    {os.aguardandoRepasseAutorizada && os.empresaAutorizadaNome && (
                      <span className="w-fit truncate rounded-full bg-info/10 px-2 py-0.5 text-[10px] font-medium text-info">
                        {os.empresaAutorizadaNome}
                      </span>
                    )}
                    <div className="mt-0.5 flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">{os.dataLabel}</span>
                      <span className="text-[13px] font-bold text-primary">{formatCurrency(os.total)}</span>
                    </div>
                  </Link>
                );
              })}
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
