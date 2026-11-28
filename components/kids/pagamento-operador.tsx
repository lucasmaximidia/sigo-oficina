"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Banknote, CreditCard, CheckCircle2, LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { criarPagamentoManualKids } from "@/lib/kids-actions";
import { logout } from "@/lib/auth-actions";
import { formatCurrency } from "@/lib/utils";
import type { KidsFormaPagamento, KidsPreco } from "@/types";

const FORMA_LABEL: Record<KidsFormaPagamento, string> = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  maquininha: "Maquininha",
};

const STATUS_LABEL: Record<string, { label: string; variant: "success" | "warning" | "secondary" }> = {
  pago: { label: "Pago", variant: "success" },
  aguardando: { label: "Aguardando", variant: "warning" },
  expirado: { label: "Expirado", variant: "secondary" },
  cancelamento_solicitado: { label: "Cancelamento pedido", variant: "warning" },
  cancelado: { label: "Cancelado", variant: "secondary" },
};

interface PagamentoHoje {
  id: string;
  tempo_min: number;
  valor: number;
  forma_pagamento: string;
  status: string;
  created_at: string;
}

type Etapa = "tempo" | "forma" | "confirmar" | "sucesso";

const formatarHora = (iso: string) => new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

export function PagamentoOperador({ precos, pagamentosHoje }: { precos: KidsPreco[]; pagamentosHoje: PagamentoHoje[] }) {
  const [etapa, setEtapa] = useState<Etapa>("tempo");
  const [precoEscolhido, setPrecoEscolhido] = useState<KidsPreco | null>(null);
  const [formaEscolhida, setFormaEscolhida] = useState<Exclude<KidsFormaPagamento, "pix"> | null>(null);
  const [isPending, startTransition] = useTransition();

  function reiniciar() {
    setEtapa("tempo");
    setPrecoEscolhido(null);
    setFormaEscolhida(null);
  }

  function confirmarRecebimento() {
    if (!precoEscolhido || !formaEscolhida) return;
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("tempo_min", String(precoEscolhido.tempo_min));
        formData.set("forma_pagamento", formaEscolhida);
        await criarPagamentoManualKids(formData);
        setEtapa("sucesso");
        setTimeout(reiniciar, 4000);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao registrar pagamento");
      }
    });
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 p-4">
      <div className="flex items-center justify-between pt-[env(safe-area-inset-top,0px)]">
        <p className="font-display text-lg font-bold text-locacao-primary">VoltCity KIDS</p>
        <form action={logout}>
          <Button type="submit" variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <LogOut className="size-4" />
            Sair
          </Button>
        </form>
      </div>

      <Tabs defaultValue="pagamento" className="flex-1">
        <TabsList className="w-full">
          <TabsTrigger value="pagamento" className="flex-1">
            Pagamento
          </TabsTrigger>
          <TabsTrigger value="hoje" className="flex-1">
            Hoje
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pagamento" className="flex flex-col gap-4">
          {etapa === "tempo" && (
            <div className="flex flex-col gap-3">
              <p className="text-center text-sm text-muted-foreground">Escolha o tempo</p>
              {precos.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">Nenhum preço ativo configurado.</p>
              )}
              {precos.map((p) => (
                <Button
                  key={p.id}
                  type="button"
                  size="lg"
                  className="h-20 flex-col gap-0.5 text-lg"
                  onClick={() => {
                    setPrecoEscolhido(p);
                    setEtapa("forma");
                  }}
                >
                  <span className="font-display text-2xl font-bold">{p.tempo_min} min</span>
                  <span className="text-sm font-normal opacity-90">{formatCurrency(p.valor)}</span>
                </Button>
              ))}
            </div>
          )}

          {etapa === "forma" && precoEscolhido && (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={reiniciar}
                className="mb-1 flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
                Cancelar
              </button>
              <p className="text-center text-sm text-muted-foreground">
                {precoEscolhido.tempo_min} min · {formatCurrency(precoEscolhido.valor)}
              </p>
              <p className="text-center text-sm font-medium">Forma de pagamento</p>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="h-16 gap-2 text-lg"
                onClick={() => {
                  setFormaEscolhida("dinheiro");
                  setEtapa("confirmar");
                }}
              >
                <Banknote className="size-5" />
                Dinheiro
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="h-16 gap-2 text-lg"
                onClick={() => {
                  setFormaEscolhida("maquininha");
                  setEtapa("confirmar");
                }}
              >
                <CreditCard className="size-5" />
                Maquininha
              </Button>
            </div>
          )}

          {etapa === "confirmar" && precoEscolhido && formaEscolhida && (
            <div className="flex flex-col items-center gap-5 py-6 text-center">
              <p className="text-lg">
                Recebeu <span className="font-display text-2xl font-bold">{formatCurrency(precoEscolhido.valor)}</span>
                <br />
                em {FORMA_LABEL[formaEscolhida]}?
              </p>
              <div className="flex w-full gap-3">
                <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setEtapa("forma")} disabled={isPending}>
                  Não
                </Button>
                <Button type="button" size="lg" className="flex-1" onClick={confirmarRecebimento} disabled={isPending}>
                  {isPending ? "Salvando..." : "Sim"}
                </Button>
              </div>
            </div>
          )}

          {etapa === "sucesso" && precoEscolhido && (
            <div className="flex flex-col items-center gap-3 py-10 text-center text-success">
              <CheckCircle2 className="size-16" />
              <p className="font-display text-2xl font-bold">PAGO ✓ {precoEscolhido.tempo_min} min</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="hoje" className="flex flex-col gap-2">
          {pagamentosHoje.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhum pagamento hoje ainda.</p>
          )}
          {pagamentosHoje.map((p) => {
            const status = STATUS_LABEL[p.status] ?? { label: p.status, variant: "secondary" as const };
            return (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                <div>
                  <p className="text-sm font-medium">
                    {p.tempo_min} min · {FORMA_LABEL[p.forma_pagamento as KidsFormaPagamento] ?? p.forma_pagamento}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatarHora(p.created_at)}</p>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
