"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
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
import { recalcularValoresCarrinhos } from "@/lib/locacao-dispositivos-actions";

export function RecalcularValoresDialog({
  periodoInicio,
  periodoFim,
  carrinhoFiltro,
}: {
  periodoInicio: string;
  periodoFim: string;
  carrinhoFiltro: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const r = await recalcularValoresCarrinhos(formData);
        toast.success(`${r.atualizados} sessão(ões) recalculada(s)`);
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao recalcular valores");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <RefreshCw className="size-4" />
          Recalcular valores
        </Button>
      </DialogTrigger>
      <DialogContent className="locacao-theme">
        <DialogHeader>
          <DialogTitle>Recalcular valores</DialogTitle>
          <DialogDescription>
            Refaz o valor das sessões ainda sem lançamento no caixa, usando os preços atuais da configuração. Sessões
            já lançadas não mudam.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="dispositivo_id" value={carrinhoFiltro === "todos" ? "" : carrinhoFiltro} />
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Label htmlFor="periodo_inicio_recalc" className="mb-1.5 block">
                De
              </Label>
              <Input id="periodo_inicio_recalc" name="periodo_inicio" type="date" defaultValue={periodoInicio} />
            </div>
            <div className="flex-1">
              <Label htmlFor="periodo_fim_recalc" className="mb-1.5 block">
                Até
              </Label>
              <Input id="periodo_fim_recalc" name="periodo_fim" type="date" defaultValue={periodoFim} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Deixe em branco pra recalcular tudo que ainda está pendente.</p>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Recalculando..." : "Recalcular"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
