"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { createAjusteCaixa } from "@/lib/locacao-actions";

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

export function AjusteCaixaDialog() {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<"entra" | "sai">("entra");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        formData.set("tipo", tipo);
        await createAjusteCaixa(formData);
        toast.success("Ajuste registrado");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao registrar ajuste");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-1.5">
          <Plus className="size-3.5" />
          Novo ajuste
        </Button>
      </DialogTrigger>
      <DialogContent className="locacao-theme">
        <DialogHeader>
          <DialogTitle>Ajuste de caixa</DialogTitle>
          <DialogDescription>Para bater o saldo calculado com o dinheiro contado na mão.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTipo("entra")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium transition-colors",
                tipo === "entra"
                  ? "border-success bg-success/10 text-success"
                  : "border-border text-muted-foreground hover:bg-secondary"
              )}
            >
              <ArrowUpCircle className="size-4" />
              Entra (+)
            </button>
            <button
              type="button"
              onClick={() => setTipo("sai")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium transition-colors",
                tipo === "sai"
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : "border-border text-muted-foreground hover:bg-secondary"
              )}
            >
              <ArrowDownCircle className="size-4" />
              Sai (−)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data" className="mb-1.5 block">
                Data
              </Label>
              <Input id="data" name="data" type="date" defaultValue={hoje()} required />
            </div>
            <div>
              <Label htmlFor="valor" className="mb-1.5 block">
                Valor (R$)
              </Label>
              <NumericInput id="valor" name="valor" required />
            </div>
          </div>

          <div>
            <Label htmlFor="motivo" className="mb-1.5 block">
              Motivo
            </Label>
            <Input id="motivo" name="motivo" required placeholder="Ex: Conferência de caixa, troco inicial..." />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Registrar ajuste"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
