"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { resetarSistema } from "@/lib/actions";

const CONFIRMACAO = "RESETAR";

export function ResetSistemaDialog() {
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleReset() {
    startTransition(async () => {
      try {
        await resetarSistema();
        toast.success("Sistema resetado");
        setOpen(false);
        setTexto("");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao resetar sistema");
      }
    });
  }

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 md:p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-destructive">Zona de Perigo</p>
          <p className="mt-1 text-sm text-destructive/90">Esta ação irá resetar todos os dados do sistema.</p>
          <p className="mt-1 text-xs text-destructive/80">
            Atenção: este processo é totalmente irreversível. Ao confirmar, todos os cadastros de clientes, ordens de
            serviço ativas e arquivadas, movimentações de estoque e histórico financeiro serão apagados
            permanentemente do banco de dados.
          </p>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="size-4" />
              Resetar Sistema
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar reset total do sistema</DialogTitle>
              <DialogDescription>
                Esta ação apaga permanentemente todos os clientes, OS, estoque, vendas, agenda e financeiro. Digite{" "}
                <span className="font-semibold text-foreground">{CONFIRMACAO}</span> para confirmar.
              </DialogDescription>
            </DialogHeader>
            <Input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={CONFIRMACAO} />
            <DialogFooter>
              <Button
                variant="destructive"
                disabled={texto !== CONFIRMACAO || isPending}
                onClick={handleReset}
              >
                {isPending ? "Resetando..." : "Apagar tudo permanentemente"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
