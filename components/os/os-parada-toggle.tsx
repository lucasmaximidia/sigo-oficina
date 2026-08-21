"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setOrdemServicoParada } from "@/lib/actions";

export function OsParadaToggle({
  osId,
  parada,
  motivo,
}: {
  osId: string;
  parada: boolean;
  motivo: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [texto, setTexto] = useState(motivo ?? "");
  const [isPending, startTransition] = useTransition();

  function marcar(novoParada: boolean, novoMotivo?: string) {
    startTransition(async () => {
      try {
        await setOrdemServicoParada(osId, novoParada, novoMotivo);
        setEditing(false);
        toast.success(novoParada ? "OS marcada como parada" : "OS retomada");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao atualizar");
      }
    });
  }

  if (parada && !editing) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{motivo || "OS parada, aguardando providência."}</p>
        </div>
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => marcar(false)}>
          Retomar
        </Button>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-border p-3">
        <Input
          placeholder="Motivo da paralisação (ex: aguardando peça do fornecedor)"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
            Cancelar
          </Button>
          <Button size="sm" disabled={isPending} onClick={() => marcar(true, texto)}>
            Marcar como parada
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>
      <AlertTriangle className="size-4" />
      Marcar OS como parada
    </Button>
  );
}
