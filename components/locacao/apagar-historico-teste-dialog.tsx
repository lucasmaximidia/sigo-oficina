"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2, AlertTriangle } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { apagarHistoricoTesteCarrinho } from "@/lib/locacao-dispositivos-actions";

export function ApagarHistoricoTesteDialog({ dispositivoId, numeroCarrinho }: { dispositivoId: string; numeroCarrinho: number }) {
  const [open, setOpen] = useState(false);
  const [confirmacao, setConfirmacao] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setConfirmacao("");
  }

  function apagar() {
    startTransition(async () => {
      try {
        await apagarHistoricoTesteCarrinho(dispositivoId);
        toast.success("Histórico de teste apagado");
        handleOpenChange(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao apagar histórico");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
          Apagar histórico de teste
        </button>
      </DialogTrigger>
      <DialogContent className="locacao-theme">
        <DialogHeader>
          <DialogTitle>Apagar histórico de teste — carrinho #{numeroCarrinho}</DialogTitle>
          <DialogDescription>
            Apaga todas as sessões desse carrinho que ainda não foram lançadas no caixa. Essa ação não pode ser
            desfeita.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-foreground">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
          <p>Se algum aluguel real desse carrinho ainda não foi lançado no caixa, ele também será apagado.</p>
        </div>
        <div>
          <Label htmlFor="confirmacao" className="mb-1.5 block">
            Digite <span className="font-semibold">{numeroCarrinho}</span> para confirmar
          </Label>
          <Input id="confirmacao" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || confirmacao !== String(numeroCarrinho)}
            onClick={apagar}
          >
            Apagar histórico de teste
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
