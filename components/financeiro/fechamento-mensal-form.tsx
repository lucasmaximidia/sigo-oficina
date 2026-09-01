"use client";

import { useState } from "react";
import { FileDown, CalendarCheck } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

function mesAnteriorPadrao() {
  const hoje = new Date();
  const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
  return `${mesAnterior.getFullYear()}-${String(mesAnterior.getMonth() + 1).padStart(2, "0")}`;
}

export function FechamentoMensalForm() {
  const [mes, setMes] = useState(mesAnteriorPadrao());

  function handleGerar() {
    if (!mes) {
      toast.error("Selecione o mês do fechamento");
      return;
    }
    window.open(`/api/financeiro/fechamento/pdf?mes=${mes}`, "_blank");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="size-4.5 text-primary" />
          Fechamento Mensal Consolidado
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Gere um resumo do mês fechado — saldo inicial, entradas, saídas, ajustes e saldo final — para imprimir e
          guardar como registro contábil.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="sm:max-w-xs">
          <Label htmlFor="fechamento_mes" className="mb-1.5 block">
            Mês
          </Label>
          <Input id="fechamento_mes" type="month" value={mes} onChange={(e) => setMes(e.target.value)} />
        </div>

        <div className="flex justify-end">
          <Button type="button" onClick={handleGerar}>
            <FileDown className="size-4" />
            Gerar PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
