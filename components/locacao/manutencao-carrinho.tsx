"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Wrench, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { registrarManutencaoCarrinho } from "@/lib/locacao-dispositivos-actions";
import { infoManutencao } from "@/lib/locacao-dispositivos-status";
import { formatDate } from "@/lib/utils";

export function ManutencaoCarrinho({
  dispositivoId,
  horimetroMinutos,
  manutencaoHorimetroMin,
  manutencaoEm,
  horasManutencao,
}: {
  dispositivoId: string;
  horimetroMinutos: number;
  manutencaoHorimetroMin: number;
  manutencaoEm: string | null;
  horasManutencao: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const info = infoManutencao(horimetroMinutos, manutencaoHorimetroMin, horasManutencao);

  function confirmar() {
    startTransition(async () => {
      try {
        await registrarManutencaoCarrinho(dispositivoId);
        toast.success("Manutenção registrada");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao registrar manutenção");
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="flex items-center gap-1.5">
        {info.status === "vencida" && <AlertTriangle className="size-3.5 text-destructive" />}
        <span className="text-muted-foreground">
          {info.status === "vencida" ? (
            <>Manutenção vencida há {Math.round(-info.horasRestantes)}h</>
          ) : info.status === "proxima" ? (
            <>Manutenção em {Math.round(info.horasRestantes)}h</>
          ) : (
            <>Próxima manutenção em {Math.round(info.horasRestantes)}h</>
          )}
        </span>
        {info.status === "vencida" && <Badge variant="destructive">Vencida</Badge>}
        {info.status === "proxima" && <Badge variant="warning">Próxima</Badge>}
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button type="button" className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground">
            <Wrench className="size-3.5" />
            Registrar manutenção
          </button>
        </DialogTrigger>
        <DialogContent className="locacao-theme">
          <DialogHeader>
            <DialogTitle>Registrar manutenção</DialogTitle>
            <DialogDescription>
              Zera a contagem de horas desde a última manutenção, a partir do horímetro atual.
              {manutencaoEm && <> Última manutenção: {formatDate(manutencaoEm)}.</>}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={confirmar} disabled={isPending}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
