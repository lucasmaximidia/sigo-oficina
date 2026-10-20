"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Settings } from "lucide-react";
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
import { NumericInput } from "@/components/ui/numeric-input";
import { updateLocacaoConfig } from "@/lib/locacao-actions";

export function CaixaConfigDialog({
  saldoInicial,
  dataInicio,
}: {
  saldoInicial: number;
  dataInicio: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateLocacaoConfig(formData);
        toast.success("Saldo inicial do caixa atualizado");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-1.5">
          <Settings className="size-3.5" />
          Configurar saldo inicial
        </Button>
      </DialogTrigger>
      <DialogContent className="locacao-theme">
        <DialogHeader>
          <DialogTitle>Saldo inicial do caixa</DialogTitle>
          <DialogDescription>
            Quanto dinheiro você já tinha em caixa antes de começar a usar o sistema, e a partir de qual data passar a
            somar entradas e saídas daqui.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="saldo_inicial" className="mb-1.5 block">
              Saldo inicial (R$)
            </Label>
            <NumericInput id="saldo_inicial" name="saldo_inicial" defaultValue={saldoInicial} />
          </div>
          <div>
            <Label htmlFor="data_inicio_caixa" className="mb-1.5 block">
              Data de início do caixa
            </Label>
            <Input id="data_inicio_caixa" name="data_inicio_caixa" type="date" defaultValue={dataInicio ?? ""} />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Lançamentos antes dessa data não entram na conta do saldo em caixa — já estão dentro do saldo inicial.
            </p>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
