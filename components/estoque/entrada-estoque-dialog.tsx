"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { PackagePlus, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createEntradaEstoque, type EntradaEstoqueParcelaInput } from "@/lib/actions";
import type { LojaParceira, Peca } from "@/types";

interface ItemLinha {
  key: string;
  pecaId: string | null;
  nomeExibicao: string;
  novaPeca?: { nome: string; codigo: string | null; categoria: string | null };
  quantidade: number;
  valorUnitario: number;
}

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

function addDias(dataISO: string, dias: number): string {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia + dias)).toISOString().slice(0, 10);
}

// 1ª parcela vence 30 dias após a NF, 2ª 60 dias, 3ª 90 dias, e assim sucessivamente.
function gerarParcelas(dataNf: string, valorTotal: number, quantidade: number): EntradaEstoqueParcelaInput[] {
  if (!dataNf || quantidade < 1) return [];
  const base = Math.floor((valorTotal / quantidade) * 100) / 100;
  const parcelas = Array.from({ length: quantidade }, (_, i) => ({
    vencimento: addDias(dataNf, (i + 1) * 30),
    valor: base,
  }));
  const resto = Math.round((valorTotal - base * quantidade) * 100) / 100;
  if (parcelas.length > 0) parcelas[parcelas.length - 1].valor = Math.round((base + resto) * 100) / 100;
  return parcelas;
}

const estadoInicial = {
  lojaId: "",
  numeroNf: "",
  dataNf: hoje(),
  dataChegada: "",
  observacoes: "",
};

export function EntradaEstoqueDialog({ lojas, pecas }: { lojas: LojaParceira[]; pecas: Peca[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [lojaId, setLojaId] = useState(estadoInicial.lojaId);
  const [numeroNf, setNumeroNf] = useState(estadoInicial.numeroNf);
  const [dataNf, setDataNf] = useState(estadoInicial.dataNf);
  const [dataChegada, setDataChegada] = useState(estadoInicial.dataChegada);
  const [observacoes, setObservacoes] = useState(estadoInicial.observacoes);

  const [itens, setItens] = useState<ItemLinha[]>([]);
  const [pecaQuery, setPecaQuery] = useState("");
  const [novaPecaMode, setNovaPecaMode] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoCodigo, setNovoCodigo] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [novaQtd, setNovaQtd] = useState(1);
  const [novoValor, setNovoValor] = useState(0);

  const [valorTotal, setValorTotal] = useState(0);
  const [numParcelas, setNumParcelas] = useState(1);
  const [parcelas, setParcelas] = useState<EntradaEstoqueParcelaInput[]>([{ vencimento: hoje(), valor: 0 }]);

  const lojaNome = useMemo(() => lojas.find((l) => l.id === lojaId)?.nome ?? null, [lojas, lojaId]);
  const subtotalItens = itens.reduce((acc, i) => acc + i.quantidade * i.valorUnitario, 0);

  const pecaResultados = useMemo(() => {
    if (!pecaQuery.trim()) return [];
    const q = pecaQuery.trim().toLowerCase();
    return pecas.filter((p) => p.nome.toLowerCase().includes(q) || p.codigo?.toLowerCase().includes(q)).slice(0, 8);
  }, [pecas, pecaQuery]);

  function resetForm() {
    setLojaId(estadoInicial.lojaId);
    setNumeroNf(estadoInicial.numeroNf);
    setDataNf(estadoInicial.dataNf);
    setDataChegada(estadoInicial.dataChegada);
    setObservacoes(estadoInicial.observacoes);
    setItens([]);
    setPecaQuery("");
    setNovaPecaMode(false);
    setNovoNome("");
    setNovoCodigo("");
    setNovaCategoria("");
    setNovaQtd(1);
    setNovoValor(0);
    setValorTotal(0);
    setNumParcelas(1);
    setParcelas([{ vencimento: hoje(), valor: 0 }]);
  }

  function handleDataNf(v: string) {
    setDataNf(v);
    setParcelas(gerarParcelas(v, valorTotal, numParcelas));
  }

  function handleValorTotal(v: number) {
    setValorTotal(v);
    setParcelas(gerarParcelas(dataNf, v, numParcelas));
  }

  function handleNumParcelas(v: number) {
    const n = Math.max(1, Math.round(v) || 1);
    setNumParcelas(n);
    setParcelas(gerarParcelas(dataNf, valorTotal, n));
  }

  function usarSubtotalItens() {
    handleValorTotal(subtotalItens);
  }

  function addItemExistente(peca: Peca) {
    setItens((prev) => {
      const idx = prev.findIndex((i) => i.pecaId === peca.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantidade: copy[idx].quantidade + 1 };
        return copy;
      }
      return [
        ...prev,
        { key: peca.id, pecaId: peca.id, nomeExibicao: peca.nome, quantidade: 1, valorUnitario: peca.preco_custo },
      ];
    });
    setPecaQuery("");
  }

  function addNovaPeca() {
    if (!novoNome.trim()) {
      toast.error("Informe o nome da nova peça");
      return;
    }
    setItens((prev) => [
      ...prev,
      {
        key: `nova-${Date.now()}`,
        pecaId: null,
        nomeExibicao: novoNome.toUpperCase(),
        novaPeca: {
          nome: novoNome.toUpperCase(),
          codigo: novoCodigo.trim() ? novoCodigo.toUpperCase() : null,
          categoria: novaCategoria.trim() ? novaCategoria.toUpperCase() : null,
        },
        quantidade: novaQtd,
        valorUnitario: novoValor,
      },
    ]);
    setNovoNome("");
    setNovoCodigo("");
    setNovaCategoria("");
    setNovaQtd(1);
    setNovoValor(0);
    setNovaPecaMode(false);
  }

  function updateItemQtd(key: string, quantidade: number) {
    setItens((prev) => prev.map((i) => (i.key === key ? { ...i, quantidade: Math.max(1, quantidade) } : i)));
  }

  function updateItemValor(key: string, valorUnitario: number) {
    setItens((prev) => prev.map((i) => (i.key === key ? { ...i, valorUnitario } : i)));
  }

  function removeItem(key: string) {
    setItens((prev) => prev.filter((i) => i.key !== key));
  }

  function updateParcela(idx: number, patch: Partial<EntradaEstoqueParcelaInput>) {
    setParcelas((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  }

  function handleSubmit() {
    if (!dataNf) {
      toast.error("Informe a data da NF");
      return;
    }
    if (itens.length === 0) {
      toast.error("Adicione ao menos um item recebido");
      return;
    }
    startTransition(async () => {
      try {
        await createEntradaEstoque({
          lojaId: lojaId || null,
          lojaNome,
          numeroNf: numeroNf.trim() ? numeroNf.trim().toUpperCase() : null,
          dataNf,
          dataChegada: dataChegada || null,
          valorTotal,
          observacoes: observacoes.trim() ? observacoes.trim().toUpperCase() : null,
          itens: itens.map((i) => ({
            peca_id: i.pecaId,
            novaPeca: i.novaPeca,
            quantidade: i.quantidade,
            valor_unitario: i.valorUnitario,
          })),
          parcelas,
        });
        toast.success("Entrada de estoque registrada");
        setOpen(false);
        resetForm();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao registrar entrada");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary">
          <PackagePlus className="size-4" />
          Entrada de Mercadoria
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Entrada de mercadoria (NF)</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Loja parceira</Label>
              <Select value={lojaId} onValueChange={setLojaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {lojas.map((loja) => (
                    <SelectItem key={loja.id} value={loja.id}>
                      {loja.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="numero_nf" className="mb-1.5 block">
                Número da NF
              </Label>
              <Input
                id="numero_nf"
                value={numeroNf}
                onChange={(e) => setNumeroNf(e.target.value)}
                placeholder="Ex: 12345"
                className="uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_nf" className="mb-1.5 block">
                Data da NF
              </Label>
              <Input id="data_nf" type="date" value={dataNf} onChange={(e) => handleDataNf(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="data_chegada" className="mb-1.5 block">
                Data de chegada (opcional)
              </Label>
              <Input id="data_chegada" type="date" value={dataChegada} onChange={(e) => setDataChegada(e.target.value)} />
            </div>
          </div>

          <div className="rounded-xl border border-border p-3">
            <p className="mb-2 text-sm font-semibold text-foreground">Itens recebidos</p>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar peça existente por nome ou código..."
                value={pecaQuery}
                onChange={(e) => setPecaQuery(e.target.value)}
                autoComplete="off"
              />
              {pecaResultados.length > 0 && (
                <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                  {pecaResultados.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addItemExistente(p)}
                      className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm hover:bg-secondary"
                    >
                      <span className="font-medium text-foreground">{p.nome}</span>
                      <span className="text-xs text-muted-foreground">{formatCurrency(p.preco_custo)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!novaPecaMode ? (
              <button
                type="button"
                onClick={() => setNovaPecaMode(true)}
                className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <Plus className="size-3.5" />
                Cadastrar peça nova nesta entrada
              </button>
            ) : (
              <div className="mt-3 flex flex-col gap-2.5 rounded-lg bg-secondary p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Nova peça</p>
                  <button type="button" onClick={() => setNovaPecaMode(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="size-4" />
                  </button>
                </div>
                <Input
                  placeholder="Nome da peça"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="uppercase"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Código (opcional)"
                    value={novoCodigo}
                    onChange={(e) => setNovoCodigo(e.target.value)}
                    className="uppercase"
                  />
                  <Input
                    placeholder="Categoria (opcional)"
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                    className="uppercase"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="mb-1 block text-xs">Quantidade</Label>
                    <NumericInput decimal={false} value={novaQtd} onValueChange={setNovaQtd} />
                  </div>
                  <div>
                    <Label className="mb-1 block text-xs">Custo unitário (R$)</Label>
                    <NumericInput value={novoValor} onValueChange={setNovoValor} />
                  </div>
                </div>
                <Button type="button" size="sm" onClick={addNovaPeca}>
                  <Plus className="size-3.5" />
                  Adicionar item
                </Button>
              </div>
            )}

            <div className="mt-3 flex flex-col gap-2">
              {itens.length === 0 && <p className="text-sm text-muted-foreground">Nenhum item adicionado ainda.</p>}
              {itens.map((item) => (
                <div key={item.key} className="flex items-center gap-2 rounded-lg border border-border p-2.5">
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{item.nomeExibicao}</p>
                  <NumericInput
                    decimal={false}
                    value={item.quantidade}
                    onValueChange={(v) => updateItemQtd(item.key, v)}
                    className="h-9 w-16 text-right"
                  />
                  <NumericInput
                    value={item.valorUnitario}
                    onValueChange={(v) => updateItemValor(item.key, v)}
                    className="h-9 w-24 text-right"
                  />
                  <p className="w-24 shrink-0 text-right text-sm font-semibold text-foreground">
                    {formatCurrency(item.quantidade * item.valorUnitario)}
                  </p>
                  <button type="button" onClick={() => removeItem(item.key)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>

            {itens.length > 0 && (
              <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                <p className="text-xs font-medium text-muted-foreground">Subtotal dos itens</p>
                <p className="text-sm font-semibold text-foreground">{formatCurrency(subtotalItens)}</p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border p-3">
            <p className="mb-2 text-sm font-semibold text-foreground">Boletos da NF</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valor_total" className="mb-1.5 block">
                  Valor total da NF (R$)
                </Label>
                <NumericInput id="valor_total" value={valorTotal} onValueChange={handleValorTotal} />
                {subtotalItens > 0 && Math.abs(subtotalItens - valorTotal) > 0.01 && (
                  <button
                    type="button"
                    onClick={usarSubtotalItens}
                    className="mt-1 text-xs font-medium text-primary hover:underline"
                  >
                    Usar subtotal dos itens ({formatCurrency(subtotalItens)})
                  </button>
                )}
              </div>
              <div>
                <Label htmlFor="parcelas" className="mb-1.5 block">
                  Quantidade de parcelas
                </Label>
                <NumericInput id="parcelas" decimal={false} value={numParcelas} onValueChange={handleNumParcelas} />
              </div>
            </div>

            {valorTotal > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                {parcelas.map((parcela, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 shrink-0 text-xs font-medium text-muted-foreground">{idx + 1}ª</span>
                    <Input
                      type="date"
                      value={parcela.vencimento}
                      onChange={(e) => updateParcela(idx, { vencimento: e.target.value })}
                      className="h-9"
                    />
                    <NumericInput
                      value={parcela.valor}
                      onValueChange={(v) => updateParcela(idx, { valor: v })}
                      className="h-9"
                    />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Vencimentos sugeridos a cada 30 dias a partir de {formatDate(dataNf)} (30, 60, 90...). Você pode
                  ajustar datas e valores de cada parcela individualmente.
                </p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="observacoes" className="mb-1.5 block">
              Observações (opcional)
            </Label>
            <Input id="observacoes" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="uppercase" />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Salvando..." : "Registrar entrada"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
