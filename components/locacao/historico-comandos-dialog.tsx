"use client";

import { useState } from "react";
import { History, CheckCircle2, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/utils";
import type { LocacaoDispositivoComando } from "@/types";

const COMANDO_LABEL: Record<string, string> = {
  zerar_contadores: "Zerar contadores",
  zerar_tudo: "Zerar tudo",
};

export function HistoricoComandosDialog({
  numeroCarrinho,
  comandos,
}: {
  numeroCarrinho: number;
  comandos: LocacaoDispositivoComando[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <History className="size-3.5" />
          Histórico de comandos
        </button>
      </DialogTrigger>
      <DialogContent className="locacao-theme">
        <DialogHeader>
          <DialogTitle>Histórico de comandos — carrinho #{numeroCarrinho}</DialogTitle>
          <DialogDescription>Comandos remotos enviados a esse carrinho.</DialogDescription>
        </DialogHeader>
        <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
          {comandos.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">Nenhum comando enviado ainda.</p>}
          {comandos.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-2 rounded-lg border border-border p-2.5 text-sm">
              <div>
                <p className="font-medium">{COMANDO_LABEL[c.comando] ?? c.comando}</p>
                <p className="text-xs text-muted-foreground">Enviado em {formatDateTime(c.criado_em)}</p>
              </div>
              {c.executado_em ? (
                <span className="flex items-center gap-1 text-xs text-success">
                  <CheckCircle2 className="size-3.5" />
                  {formatDateTime(c.executado_em)}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  Aguardando
                </span>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
