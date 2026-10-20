"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { Bell, X } from "lucide-react";
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

const STORAGE_KEY = "sigo-notificacoes-dispensadas";

// Pequeno pub-sub local pra expor o localStorage como external store do
// useSyncExternalStore — o jeito correto de ler um valor só disponível no
// cliente sem causar mismatch de hidratação (o snapshot do servidor é
// sempre "nenhuma dispensada").
let ouvintes: Array<() => void> = [];
function inscrever(callback: () => void) {
  ouvintes.push(callback);
  return () => {
    ouvintes = ouvintes.filter((l) => l !== callback);
  };
}
function avisarMudanca() {
  ouvintes.forEach((l) => l());
}

function snapshotCliente(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}
function snapshotServidor(): string {
  return "[]";
}

function salvarDispensadas(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage indisponível (modo privado, por exemplo) — a dispensa só
    // dura a sessão atual, sem quebrar a funcionalidade.
  }
  avisarMudanca();
}

export function NotificacoesBell({ contas, pecas }: { contas: NotificacaoConta[]; pecas: NotificacaoPeca[] }) {
  // Dispensar só esconde o alerta do sino neste dispositivo (não resolve a
  // pendência em si — a conta continua aparecendo em Financeiro até ser
  // paga, e a peça em Estoque até repor). Guarda no localStorage pra não
  // reaparecer a cada visita.
  const dispensadasRaw = useSyncExternalStore(inscrever, snapshotCliente, snapshotServidor);
  const dispensadas = useMemo(() => {
    try {
      return new Set<string>(JSON.parse(dispensadasRaw));
    } catch {
      return new Set<string>();
    }
  }, [dispensadasRaw]);

  const contasVisiveis = contas.filter((c) => !dispensadas.has(c.id));
  const pecasVisiveis = pecas.filter((p) => !dispensadas.has(p.id));
  const total = contasVisiveis.length + pecasVisiveis.length;

  function dispensar(id: string) {
    salvarDispensadas(new Set(dispensadas).add(id));
  }

  function limparTudo() {
    const next = new Set(dispensadas);
    contasVisiveis.forEach((c) => next.add(c.id));
    pecasVisiveis.forEach((p) => next.add(p.id));
    salvarDispensadas(next);
  }

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
        <div className="flex items-center justify-between border-b border-border p-3">
          <p className="text-sm font-semibold text-foreground">Notificações</p>
          {total > 0 && (
            <button type="button" onClick={limparTudo} className="text-xs font-medium text-primary hover:underline">
              Limpar tudo
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {total === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">Nenhum alerta no momento.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {contasVisiveis.length > 0 && (
                <div className="p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Contas vencendo/atrasadas
                  </p>
                  <div className="flex flex-col gap-1">
                    {contasVisiveis.map((conta) => (
                      <div key={conta.id} className="flex items-center gap-1 rounded-lg hover:bg-secondary/60">
                        <Link href="/financeiro" className="flex min-w-0 flex-1 items-center justify-between gap-2 p-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm text-foreground">{conta.descricao}</p>
                            <p className="text-xs text-muted-foreground">Venc. {formatDate(conta.vencimento)}</p>
                          </div>
                          <span className="shrink-0 text-sm font-medium text-destructive">
                            {formatCurrency(conta.valor)}
                          </span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => dispensar(conta.id)}
                          aria-label="Dispensar notificação"
                          className="-ml-1 shrink-0 rounded-md p-2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {pecasVisiveis.length > 0 && (
                <div className="p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Estoque baixo
                  </p>
                  <div className="flex flex-col gap-1">
                    {pecasVisiveis.map((peca) => (
                      <div key={peca.id} className="flex items-center gap-1 rounded-lg hover:bg-secondary/60">
                        <Link href="/estoque" className="flex min-w-0 flex-1 items-center justify-between gap-2 p-2">
                          <p className="truncate text-sm text-foreground">{peca.nome}</p>
                          <Badge variant={peca.quantidade === 0 ? "destructive" : "warning"}>
                            {peca.quantidade} un.
                          </Badge>
                        </Link>
                        <button
                          type="button"
                          onClick={() => dispensar(peca.id)}
                          aria-label="Dispensar notificação"
                          className="-ml-1 shrink-0 rounded-md p-2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
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
