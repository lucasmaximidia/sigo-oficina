"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Search, Minus, Plus, Trash2, Wallet, CreditCard, QrCode, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { finalizarVendaPdv, type PdvItemInput } from "@/lib/actions";
import type { FormaPagamento, Peca, VendaPdv } from "@/types";

interface CartItem extends PdvItemInput {
  key: string;
}

interface PagamentoSelecionado {
  forma_pagamento: FormaPagamento;
  valor: number;
}

const formasPagamento: { value: FormaPagamento; label: string; icon: typeof Wallet }[] = [
  { value: "dinheiro", label: "Dinheiro", icon: Wallet },
  { value: "pix", label: "PIX", icon: QrCode },
  { value: "cartao", label: "Cartão", icon: CreditCard },
];

const CENTAVO = 0.01;

export function PdvClient({
  pecas,
  vendasRecentes,
}: {
  pecas: Peca[];
  vendasRecentes: (VendaPdv & { venda_itens: { descricao: string; quantidade: number }[] })[];
}) {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pagamentos, setPagamentos] = useState<PagamentoSelecionado[]>([{ forma_pagamento: "dinheiro", valor: 0 }]);
  const [desconto, setDesconto] = useState(0);
  const [clienteNome, setClienteNome] = useState("");
  const [isPending, startTransition] = useTransition();

  const resultados = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return pecas.filter((p) => p.nome.toLowerCase().includes(q) || p.codigo?.toLowerCase().includes(q)).slice(0, 8);
  }, [pecas, query]);

  const subtotal = cart.reduce((acc, i) => acc + i.quantidade * i.valor_unitario, 0);
  const total = Math.max(0, subtotal - desconto);

  // Com uma única forma de pagamento selecionada, o valor dela sempre
  // acompanha o total automaticamente (não precisa digitar nada); só ao
  // dividir entre duas ou mais formas é que os valores manuais entram em jogo.
  const pagamentosEfetivos: PagamentoSelecionado[] =
    pagamentos.length === 1 ? [{ ...pagamentos[0], valor: total }] : pagamentos;
  const totalAlocado = pagamentosEfetivos.reduce((acc, p) => acc + p.valor, 0);
  const restante = Math.round((total - totalAlocado) * 100) / 100;
  const pagamentosBatem = Math.abs(restante) < CENTAVO;

  function togglePagamento(forma: FormaPagamento) {
    setPagamentos((prev) => {
      const existe = prev.find((p) => p.forma_pagamento === forma);
      if (existe) {
        const restantes = prev.filter((p) => p.forma_pagamento !== forma);
        if (restantes.length === 1) restantes[0] = { ...restantes[0], valor: total };
        return restantes.length > 0 ? restantes : prev;
      }
      const jaAlocado = prev.reduce((acc, p) => acc + p.valor, 0);
      const sugestao = Math.max(0, Math.round((total - jaAlocado) * 100) / 100);
      return [...prev, { forma_pagamento: forma, valor: sugestao }];
    });
  }

  function updatePagamentoValor(forma: FormaPagamento, valor: number) {
    setPagamentos((prev) => prev.map((p) => (p.forma_pagamento === forma ? { ...p, valor } : p)));
  }

  function addPeca(peca: Peca) {
    setCart((prev) => {
      const existing = prev.find((i) => i.peca_id === peca.id);
      if (existing) {
        return prev.map((i) => (i.peca_id === peca.id ? { ...i, quantidade: i.quantidade + 1 } : i));
      }
      return [
        ...prev,
        {
          key: peca.id,
          peca_id: peca.id,
          descricao: peca.nome,
          tipo: "peca",
          quantidade: 1,
          valor_unitario: peca.preco_venda,
        },
      ];
    });
    setQuery("");
  }

  function addServicoAvulso() {
    setCart((prev) => [
      ...prev,
      {
        key: `servico-${Date.now()}`,
        peca_id: null,
        descricao: "Mão de Obra Avulsa",
        tipo: "servico",
        quantidade: 1,
        valor_unitario: 0,
      },
    ]);
  }

  function updateQty(key: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (i.key === key ? { ...i, quantidade: Math.max(1, i.quantidade + delta) } : i))
        .filter((i) => i.quantidade > 0)
    );
  }

  function updateValor(key: string, valor: number) {
    setCart((prev) => prev.map((i) => (i.key === key ? { ...i, valor_unitario: valor } : i)));
  }

  function removeItem(key: string) {
    setCart((prev) => prev.filter((i) => i.key !== key));
  }

  function finalizar() {
    if (cart.length === 0) {
      toast.error("Adicione ao menos um item à venda");
      return;
    }
    if (!pagamentosBatem) {
      toast.error("A soma das formas de pagamento precisa bater com o total da venda");
      return;
    }
    startTransition(async () => {
      try {
        await finalizarVendaPdv({
          clienteId: null,
          clienteNomeAvulso: clienteNome || null,
          pagamentos: pagamentosEfetivos.filter((p) => p.valor > 0),
          desconto,
          itens: cart.map((item) => ({
            peca_id: item.peca_id,
            descricao: item.descricao,
            tipo: item.tipo,
            quantidade: item.quantidade,
            valor_unitario: item.valor_unitario,
          })),
        });
        toast.success("Venda finalizada com sucesso!");
        setCart([]);
        setDesconto(0);
        setClienteNome("");
        setPagamentos([{ forma_pagamento: "dinheiro", valor: 0 }]);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao finalizar venda");
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar peça por nome, código ou código de barras..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {resultados.length > 0 && (
            <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-white shadow-lg">
              {resultados.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addPeca(p)}
                  className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm hover:bg-secondary"
                >
                  <span className="font-medium text-foreground">{p.nome}</span>
                  <span className="text-muted-foreground">{formatCurrency(p.preco_venda)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={addServicoAvulso}>
            + Mão de Obra Avulsa
          </Button>
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Itens da Venda</CardTitle>
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-primary">
              {cart.length} {cart.length === 1 ? "item" : "itens"}
            </span>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {cart.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">Nenhum item adicionado.</p>
            )}
            {cart.map((item) => (
              <div key={item.key} className="flex items-center gap-3 py-3">
                <div className="flex items-center gap-1.5 rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => updateQty(item.key, -1)}
                    className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantidade}</span>
                  <button
                    type="button"
                    onClick={() => updateQty(item.key, 1)}
                    className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.descricao}
                    {item.tipo === "servico" && (
                      <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        Serviço
                      </span>
                    )}
                  </p>
                </div>
                <Input
                  type="number"
                  step="0.01"
                  value={item.valor_unitario}
                  onChange={(e) => updateValor(item.key, Number(e.target.value) || 0)}
                  className="h-9 w-24 text-right"
                />
                <p className="w-24 shrink-0 text-right text-sm font-semibold text-foreground">
                  {formatCurrency(item.quantidade * item.valor_unitario)}
                </p>
                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Forma de Pagamento</CardTitle>
            <p className="text-xs text-muted-foreground">Selecione uma ou mais formas para dividir o pagamento.</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <div className="grid grid-cols-3 gap-2">
                {formasPagamento.map((fp) => {
                  const Icon = fp.icon;
                  const active = pagamentos.some((p) => p.forma_pagamento === fp.value);
                  return (
                    <button
                      key={fp.value}
                      type="button"
                      onClick={() => togglePagamento(fp.value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-xl border py-3 text-xs font-medium transition-colors",
                        active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      <Icon className="size-4.5" />
                      {fp.label}
                    </button>
                  );
                })}
              </div>

              {pagamentos.length > 1 && (
                <div className="mt-3 flex flex-col gap-2">
                  {pagamentos.map((p) => {
                    const info = formasPagamento.find((fp) => fp.value === p.forma_pagamento)!;
                    return (
                      <div key={p.forma_pagamento} className="flex items-center gap-2">
                        <span className="w-16 shrink-0 text-xs font-medium text-muted-foreground">{info.label}</span>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          value={p.valor}
                          onChange={(e) => updatePagamentoValor(p.forma_pagamento, Number(e.target.value) || 0)}
                          className="h-9"
                        />
                      </div>
                    );
                  })}
                  <p
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-medium",
                      pagamentosBatem ? "text-success" : "text-destructive"
                    )}
                  >
                    {!pagamentosBatem && <AlertCircle className="size-3.5" />}
                    {pagamentosBatem
                      ? "Valores conferem com o total"
                      : restante > 0
                        ? `Faltam ${formatCurrency(restante)} para completar o total`
                        : `${formatCurrency(Math.abs(restante))} a mais do que o total`}
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Desconto (R$)</p>
              <Input type="number" step="0.01" min={0} value={desconto} onChange={(e) => setDesconto(Number(e.target.value) || 0)} />
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Desconto</span>
              <span>- {formatCurrency(desconto)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-base font-semibold text-foreground">Total</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
            </div>

            <Input
              placeholder="Nome do Cliente (Opcional)"
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
            />

            <Button size="lg" onClick={finalizar} disabled={isPending || !pagamentosBatem || cart.length === 0}>
              {isPending ? "Finalizando..." : "Finalizar Venda"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendas Recentes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {vendasRecentes.length === 0 && <p className="py-4 text-sm text-muted-foreground">Nenhuma venda ainda.</p>}
            {vendasRecentes.map((venda) => (
              <div key={venda.id} className="flex items-center justify-between gap-2 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    #{String(venda.numero).padStart(4, "0")} · {formatDateTime(venda.created_at)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {venda.venda_itens.map((i) => `${i.quantidade}x ${i.descricao}`).join(", ")}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-foreground">{formatCurrency(venda.total)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
