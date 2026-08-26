"use client";

import { useState } from "react";
import { Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FecharContaParceiroButton } from "@/components/financeiro/fechar-conta-parceiro-button";
import { formatCurrency } from "@/lib/utils";
import type { ParceiroPendente } from "@/types";

export function AcertoParceiros({ parceiros }: { parceiros: ParceiroPendente[] }) {
  const [mostrarTodos, setMostrarTodos] = useState(false);

  const visiveis = parceiros
    .map((parceiro) => ({
      ...parceiro,
      itens: parceiro.itens.filter((item) => mostrarTodos || item.clientePagou),
    }))
    .filter((parceiro) => parceiro.itens.length > 0);

  if (parceiros.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end gap-2.5">
        <Label htmlFor="mostrar-todos-parceiro" className="text-sm text-muted-foreground">
          Mostrar todas as despesas
        </Label>
        <Switch id="mostrar-todos-parceiro" checked={mostrarTodos} onCheckedChange={setMostrarTodos} />
      </div>

      {visiveis.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum item ainda pago pelo cliente com parceiros.</p>
      )}

      {visiveis.map((parceiro) => (
        <Card key={parceiro.lojaId}>
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Store className="size-4.5 text-primary" />
                {parceiro.lojaNome}
              </CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {parceiro.itens.length} {parceiro.itens.length === 1 ? "item" : "itens"}
                {mostrarTodos ? " pendentes" : " pagos pelo cliente"}, aguardando acerto
              </p>
            </div>
            {parceiro.totalFechavel > 0 && (
              <FecharContaParceiroButton
                lojaParceiraId={parceiro.lojaId}
                lojaNome={parceiro.lojaNome}
                total={parceiro.totalFechavel}
              />
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {parceiro.itens.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 rounded-lg border border-border p-3 text-sm"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate text-foreground">
                    {item.descricao}
                    {item.osNumero && (
                      <span className="text-muted-foreground"> · OS #OS-{String(item.osNumero).padStart(4, "0")}</span>
                    )}
                  </span>
                  {!item.clientePagou && (
                    <Badge variant="warning" className="w-fit">
                      Aguardando cliente
                    </Badge>
                  )}
                </div>
                <span className="shrink-0 font-medium text-foreground">{formatCurrency(item.valor)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
