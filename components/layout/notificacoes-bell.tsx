"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface NotificacaoConta {
  id: string;
  descricao: string;
  vencimento: string;
  valor: number;
}

export interface NotificacaoPeca {
  id: string;
  nome: string;
  quantidade: number;
}

export function NotificacoesBell({ contas, pecas }: { contas: NotificacaoConta[]; pecas: NotificacaoPeca[] }) {
  const total = contas.length + pecas.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notificações" className="relative">
          <Bell className="size-5" />
          {total > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {total > 9 ? "9+" : total}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <p className="border-b border-border p-3 text-sm font-semibold text-foreground">Notificações</p>
        <div className="max-h-96 overflow-y-auto">
          {total === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">Nenhum alerta no momento.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {contas.length > 0 && (
                <div className="p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Contas vencendo/atrasadas
                  </p>
                  <div className="flex flex-col gap-1">
                    {contas.map((conta) => (
                      <Link
                        key={conta.id}
                        href="/financeiro"
                        className="flex items-center justify-between gap-2 rounded-lg p-2 hover:bg-secondary/60"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm text-foreground">{conta.descricao}</p>
                          <p className="text-xs text-muted-foreground">Venc. {formatDate(conta.vencimento)}</p>
                        </div>
                        <span className="shrink-0 text-sm font-medium text-destructive">
                          {formatCurrency(conta.valor)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {pecas.length > 0 && (
                <div className="p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Estoque baixo
                  </p>
                  <div className="flex flex-col gap-1">
                    {pecas.map((peca) => (
                      <Link
                        key={peca.id}
                        href="/estoque"
                        className="flex items-center justify-between gap-2 rounded-lg p-2 hover:bg-secondary/60"
                      >
                        <p className="truncate text-sm text-foreground">{peca.nome}</p>
                        <Badge variant={peca.quantidade === 0 ? "destructive" : "warning"}>
                          {peca.quantidade} un.
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
