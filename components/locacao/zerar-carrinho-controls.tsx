"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { RotateCcw, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { enviarComandoCarrinho } from "@/lib/locacao-dispositivos-actions";
import { formatDateTime } from "@/lib/utils";
import type { LocacaoComandoDispositivo } from "@/types";

const COMANDO_LABEL: Record<LocacaoComandoDispositivo, string> = {
  zerar_contadores: "Zerar contadores",
  zerar_tudo: "Zerar tudo (contadores + horímetro)",
};

function ComandoDialog({
  dispositivoId,
  comando,
  descricao,
}: {
  dispositivoId: string;
  comando: LocacaoComandoDispositivo;
  descricao: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function confirmar() {
    startTransition(async () => {
      try {
        await enviarComandoCarrinho(dispositivoId, comando);
        toast.success("Comando enviado — o carrinho confirma no próximo heartbeat");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao enviar comando");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <RotateCcw className="size-3.5" />
          {COMANDO_LABEL[comando]}
        </Button>
      </DialogTrigger>
      <DialogContent className="locacao-theme">
        <DialogHeader>
          <DialogTitle>{COMANDO_LABEL[comando]}?</DialogTitle>
          <DialogDescription>{descricao}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={confirmar} disabled={isPending}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ZerarCarrinhoControls({
  dispositivoId,
  comando,
  comandoCriadoEm,
  comandoExecutadoEm,
  comandoUltimo,
}: {
  dispositivoId: string;
  comando: LocacaoComandoDispositivo | null;
  comandoCriadoEm: string | null;
  comandoExecutadoEm: string | null;
  comandoUltimo: string | null;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <ComandoDialog
          dispositivoId={dispositivoId}
          comando="zerar_contadores"
          descricao="Zera os contadores 15MIN/5MIN/LIVRE desse carrinho no próximo heartbeat."
        />
        <ComandoDialog
          dispositivoId={dispositivoId}
          comando="zerar_tudo"
          descricao="Zera os contadores 15MIN/5MIN/LIVRE e também o horímetro desse carrinho no próximo heartbeat."
        />
      </div>
      {comando ? (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          Aguardando o carrinho… (enviado às {comandoCriadoEm ? formatDateTime(comandoCriadoEm).slice(-5) : "—"})
        </p>
      ) : (
        comandoExecutadoEm && (
          <p className="flex items-center gap-1.5 text-xs text-success">
            <CheckCircle2 className="size-3.5" />
            {comandoUltimo ? COMANDO_LABEL[comandoUltimo as LocacaoComandoDispositivo] : "Zerado"} em{" "}
            {formatDateTime(comandoExecutadoEm)}
          </p>
        )
      )}
    </div>
  );
}
