"use client";

import { useState } from "react";
import { ChevronDown, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import type { BalancoEstoqueComItens } from "@/types";

export function BalancoHistorico({ balancos }: { balancos: BalancoEstoqueComItens[] }) {
  const [abertoId, setAbertoId] = useState<string>("");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="size-4.5 text-primary" />
          Histórico de Balanços
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {balancos.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum balanço realizado ainda.</p>
        )}
        {balancos.map((balanco) => {
          const divergentes = balanco.itens.filter((item) => item.diferenca !== 0);
          const aberto = abertoId === balanco.id;
          return (
            <div key={balanco.id} className="overflow-hidden rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setAbertoId(aberto ? "" : balanco.id)}
                className="flex w-full flex-col gap-1 p-3.5 text-left"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{formatDate(balanco.data)}</p>
                  <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", aberto && "rotate-180")} />
                </div>
                {balanco.observacao && <p className="truncate text-xs text-muted-foreground">{balanco.observacao}</p>}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{balanco.itens.length} contados</span>
                  {divergentes.length > 0 ? (
                    <Badge variant="destructive">{divergentes.length} c/ diferença</Badge>
                  ) : (
                    <Badge variant="success">Tudo conferiu</Badge>
                  )}
                </div>
              </button>
              {aberto && (
                <div className="flex flex-col gap-1.5 border-t border-border p-3.5">
                  {balanco.itens.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate text-foreground">{item.peca_nome}</span>
                      <span
                        className={cn(
                          "shrink-0 font-medium",
                          item.diferenca === 0
                            ? "text-muted-foreground"
                            : item.diferenca > 0
                              ? "text-success"
                              : "text-destructive"
                        )}
                      >
                        {item.quantidade_sistema} → {item.quantidade_contada}
                        {item.diferenca !== 0 && ` (${item.diferenca > 0 ? "+" : ""}${item.diferenca})`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
