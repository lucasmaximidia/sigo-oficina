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
import { Checkbox } from "@/components/ui/checkbox";
import { NumericInput } from "@/components/ui/numeric-input";
import { updateLocacaoConfig } from "@/lib/locacao-actions";

export function CaixaConfigDialog({
  saldoInicial,
  dataInicio,
  extensaoAtrasoAtivo,
  extensaoAtrasoHoras,
}: {
  saldoInicial: number;
  dataInicio: string | null;
  extensaoAtrasoAtivo: boolean;
  extensaoAtrasoHoras: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateLocacaoConfig(formData);
        toast.success("Configurações salvas");
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
          Configurações
        </Button>
      </DialogTrigger>
      <DialogContent className="locacao-theme">
        <DialogHeader>
          <DialogTitle>Configurações da Locação</DialogTitle>
          <DialogDescription>Saldo inicial do caixa e regras de atraso na devolução.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Saldo em caixa</p>
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

          <div className="flex flex-col gap-2.5 border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Diária extra por atraso
            </p>
            <label className="flex items-center gap-2.5">
              <Checkbox name="extensao_atraso_ativo" defaultChecked={extensaoAtrasoAtivo} />
              <span className="text-sm text-foreground">Lançar diária extra automaticamente em aluguéis atrasados</span>
            </label>
            <div className="max-w-[calc(50%-0.375rem)]">
              <Label htmlFor="extensao_atraso_horas" className="mb-1.5 block">
                Tolerância antes de lançar (horas)
              </Label>
              <NumericInput
                id="extensao_atraso_horas"
                name="extensao_atraso_horas"
                decimal={false}
                defaultValue={extensaoAtrasoHoras}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Passado esse tempo de atraso, o próprio aluguel é estendido por mais 1 dia (valor sobe 1 diária,
              mantendo o que já foi pago registrado) — repete a cada 24h adicionais enquanto não devolver.
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
