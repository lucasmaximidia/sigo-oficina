"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { KeyRound, Copy, CheckCircle2, AlertTriangle } from "lucide-react";
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
import { regenerarTokenCarrinho } from "@/lib/locacao-dispositivos-actions";

export function RegenerarTokenDialog({ dispositivoId, numeroCarrinho }: { dispositivoId: string; numeroCarrinho: number }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [resultado, setResultado] = useState<{ deviceToken: string } | null>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setResultado(null);
  }

  function gerar() {
    startTransition(async () => {
      try {
        const r = await regenerarTokenCarrinho(dispositivoId);
        setResultado(r);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao gerar novo token");
      }
    });
  }

  function copiarToken() {
    if (!resultado) return;
    navigator.clipboard.writeText(resultado.deviceToken);
    toast.success("Token copiado");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          title="Gerar novo token"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <KeyRound className="size-3.5" />
          Gerar novo token
        </button>
      </DialogTrigger>
      <DialogContent className="locacao-theme">
        <DialogHeader>
          <DialogTitle>Gerar novo token — carrinho #{numeroCarrinho}</DialogTitle>
          <DialogDescription>
            {resultado
              ? "Digite esse token na configuração do ESP32. O carrinho para de responder até isso ser feito."
              : "Use se o carrinho foi perdido ou clonado. O token atual deixa de funcionar imediatamente."}
          </DialogDescription>
        </DialogHeader>

        {!resultado ? (
          <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-foreground">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <p>O carrinho #{numeroCarrinho} vai parar de se conectar até você digitar o novo token nele.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-3">
            <div className="flex items-start gap-2 text-sm text-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
              <p>Novo token gerado.</p>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-md border border-border bg-card px-2 py-1.5 text-xs text-muted-foreground">
                {resultado.deviceToken}
              </code>
              <Button type="button" variant="outline" size="icon" onClick={copiarToken} title="Copiar token">
                <Copy className="size-4" />
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          {!resultado ? (
            <Button type="button" variant="destructive" disabled={isPending} onClick={gerar}>
              Gerar novo token
            </Button>
          ) : (
            <Button type="button" onClick={() => handleOpenChange(false)}>
              Concluir
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
