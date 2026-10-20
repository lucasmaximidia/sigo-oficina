"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { registrarDevolucao } from "@/lib/locacao-actions";

export function DevolverDialog({
  aluguelId,
  veiculoId,
  kmInicio,
  open,
  onOpenChange,
}: {
  aluguelId: string;
  veiculoId: string;
  kmInicio?: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [kmFim, setKmFim] = useState("");
  const [isPending, startTransition] = useTransition();

  function confirmar(status: "disponivel" | "manutencao") {
    const km = kmFim.trim() === "" ? null : parseInt(kmFim, 10);
    if (km != null && kmInicio != null && km < kmInicio) {
      toast.error("KM final não pode ser menor que o KM inicial");
      return;
    }
    startTransition(async () => {
      try {
        await registrarDevolucao(aluguelId, veiculoId, status, km);
        toast.success("Devolução registrada");
        onOpenChange(false);
        setKmFim("");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao registrar devolução");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar devolução</DialogTitle>
          <DialogDescription>Informe o KM final e em que condição o veículo foi devolvido.</DialogDescription>
        </DialogHeader>

        <div>
          <Label htmlFor="km_fim" className="mb-1.5 block">
            KM final (opcional){kmInicio != null && ` · inicial: ${kmInicio} km`}
          </Label>
          <Input
            id="km_fim"
            type="number"
            inputMode="numeric"
            placeholder="Ex: 1280"
            value={kmFim}
            onChange={(e) => setKmFim(e.target.value)}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => confirmar("manutencao")}
            className="gap-2"
          >
            <Wrench className="size-4" />
            Precisa de manutenção
          </Button>
          <Button type="button" disabled={isPending} onClick={() => confirmar("disponivel")} className="gap-2">
            <CheckCircle2 className="size-4" />
            Está em boas condições
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
