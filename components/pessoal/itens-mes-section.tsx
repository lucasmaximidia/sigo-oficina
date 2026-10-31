"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LancarItemMesDialog } from "@/components/pessoal/lancar-item-mes-dialog";
import { ConfirmarItemMesDialog } from "@/components/pessoal/confirmar-item-mes-dialog";
import { ExcluirItemMesButton } from "@/components/pessoal/pessoal-excluir-buttons";
import { copiarItensMesAnterior } from "@/lib/pessoal-actions";
import { PESSOAL_SECAO_LABEL } from "@/lib/pessoal-status";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PessoalItemMes, PessoalItemSecao } from "@/types";

const SECOES: PessoalItemSecao[] = ["fixa", "carro", "dizimo", "extra"];

export function ItensMesSection({ itens, mes }: { itens: PessoalItemMes[]; mes: string }) {
  const [isPending, startTransition] = useTransition();

  function handleCopiar() {
    startTransition(async () => {
      try {
        await copiarItensMesAnterior(mes);
        toast.success("Itens copiados do mês anterior");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao copiar");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={handleCopiar} disabled={isPending}>
          <Copy className="size-4" />
          {isPending ? "Copiando..." : "Copiar contas fixas/carro/dízimo do mês anterior"}
        </Button>
      </div>

      {SECOES.map((secao) => {
        const itensDaSecao = itens.filter((i) => i.secao === secao);
        const totalPrevisto = itensDaSecao.reduce((acc, i) => acc + i.valor_previsto, 0);
        const totalReal = itensDaSecao.reduce((acc, i) => acc + (i.valor_real ?? 0), 0);

        return (
          <Card key={secao}>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>{PESSOAL_SECAO_LABEL[secao]}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Previsto {formatCurrency(totalPrevisto)} · Real {formatCurrency(totalReal)}
                </p>
              </div>
              <LancarItemMesDialog mes={mes} secao={secao} />
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {itensDaSecao.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum item ainda.</p>
              ) : (
                itensDaSecao.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-lg border border-border p-3 text-sm"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="truncate font-medium text-foreground">{item.descricao}</span>
                      <span className="text-xs text-muted-foreground">
                        Previsto {formatCurrency(item.valor_previsto)}
                        {item.forma_pagamento ? ` · ${item.forma_pagamento}` : ""}
                        {item.pago_em ? ` · pago em ${formatDate(item.pago_em)}` : ""}
                      </span>
                    </div>
                    {item.valor_real != null ? (
                      <Badge variant="success">{formatCurrency(item.valor_real)}</Badge>
                    ) : (
                      <ConfirmarItemMesDialog id={item.id} descricao={item.descricao} valorPrevisto={item.valor_previsto} />
                    )}
                    <ExcluirItemMesButton id={item.id} descricao={item.descricao} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
