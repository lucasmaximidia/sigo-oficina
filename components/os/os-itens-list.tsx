"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Package, Store, Zap, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { addOsItem, removeOsItem } from "@/lib/actions";
import type { OsItem, Peca, LojaParceira, ItemOrigem } from "@/types";

const origemInfo: Record<ItemOrigem, { label: string; icon: typeof Package; variant: "secondary" | "info" | "warning" }> = {
  estoque: { label: "Estoque", icon: Package, variant: "secondary" },
  loja_parceira: { label: "Loja parceira", icon: Store, variant: "info" },
  compra_emergencial: { label: "Compra emergencial", icon: Zap, variant: "warning" },
};

export function OsItensList({
  osId,
  itens,
  pecas,
  lojas,
}: {
  osId: string;
  itens: OsItem[];
  pecas: Peca[];
  lojas: LojaParceira[];
}) {
  const [open, setOpen] = useState(false);
  const [origem, setOrigem] = useState<ItemOrigem>("estoque");
  const [pecaId, setPecaId] = useState<string>("");
  const [pecaQuery, setPecaQuery] = useState("");
  const [lojaParceiraId, setLojaParceiraId] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const pecaSelecionada = useMemo(() => pecas.find((p) => p.id === pecaId), [pecas, pecaId]);
  const lojasPorId = useMemo(() => new Map(lojas.map((l) => [l.id, l.nome])), [lojas]);
  const total = itens.reduce((acc, i) => acc + i.quantidade * i.valor_unitario, 0);

  const pecaResultados = useMemo(() => {
    if (pecaSelecionada || !pecaQuery.trim()) return [];
    const q = pecaQuery.trim().toLowerCase();
    return pecas.filter((p) => p.nome.toLowerCase().includes(q) || p.codigo?.toLowerCase().includes(q)).slice(0, 8);
  }, [pecas, pecaQuery, pecaSelecionada]);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await addOsItem(osId, formData);
        toast.success("Item adicionado");
        setOpen(false);
        setPecaId("");
        setPecaQuery("");
        setLojaParceiraId("");
        setOrigem("estoque");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao adicionar item");
      }
    });
  }

  function handleRemove(itemId: string) {
    startTransition(async () => {
      try {
        await removeOsItem(itemId, osId);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao remover item");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Peças e materiais</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" size="sm" variant="secondary">
              <Plus className="size-4" />
              Adicionar item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar peça ou serviço</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="flex flex-col gap-4">
              <div>
                <Label className="mb-1.5 block">Origem</Label>
                <Select
                  name="origem"
                  value={origem}
                  onValueChange={(v) => {
                    setOrigem(v as ItemOrigem);
                    setPecaId("");
                    setPecaQuery("");
                    setLojaParceiraId("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="estoque">Estoque próprio</SelectItem>
                    <SelectItem value="loja_parceira">Loja parceira</SelectItem>
                    <SelectItem value="compra_emergencial">Compra emergencial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {origem === "loja_parceira" && (
                <div>
                  <Label className="mb-1.5 block">Loja parceira</Label>
                  <Select name="loja_parceira_id" value={lojaParceiraId} onValueChange={setLojaParceiraId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a loja..." />
                    </SelectTrigger>
                    <SelectContent>
                      {lojas.map((loja) => (
                        <SelectItem key={loja.id} value={loja.id}>
                          {loja.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {lojas.length === 0 && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Nenhuma loja parceira cadastrada. Cadastre em Estoque → Lojas Parceiras.
                    </p>
                  )}
                </div>
              )}

              {origem === "estoque" && (
                <div>
                  <Label className="mb-1.5 block">Peça do estoque</Label>
                  {pecaSelecionada ? (
                    <div className="flex items-center justify-between gap-2 rounded-xl border border-primary/30 bg-accent/40 p-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{pecaSelecionada.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {pecaSelecionada.quantidade} em estoque · {formatCurrency(pecaSelecionada.preco_venda)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPecaId("");
                          setPecaQuery("");
                        }}
                        className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-foreground/10"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        placeholder="Buscar peça por nome ou código..."
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
                              onClick={() => {
                                setPecaId(p.id);
                                setPecaQuery(p.nome);
                              }}
                              className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm hover:bg-secondary"
                            >
                              <span className="font-medium text-foreground">{p.nome}</span>
                              <span className="text-xs text-muted-foreground">{p.quantidade} em estoque</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <input type="hidden" name="peca_id" value={pecaId} />
                </div>
              )}

              <div>
                <Label htmlFor="descricao" className="mb-1.5 block">
                  Descrição
                </Label>
                <Input
                  key={`descricao-${pecaId}`}
                  id="descricao"
                  name="descricao"
                  required
                  defaultValue={pecaSelecionada?.nome ?? ""}
                  placeholder="Ex: Mão de obra avulsa, correia, mangueira..."
                  className="uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantidade" className="mb-1.5 block">
                    Quantidade
                  </Label>
                  <NumericInput id="quantidade" name="quantidade" decimal={false} defaultValue={1} />
                </div>
                <div>
                  <Label htmlFor="valor_unitario" className="mb-1.5 block">
                    Valor unitário (R$)
                  </Label>
                  <NumericInput
                    key={`valor-${pecaId}`}
                    id="valor_unitario"
                    name="valor_unitario"
                    defaultValue={pecaSelecionada?.preco_venda ?? 0}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isPending || (origem === "loja_parceira" && !lojaParceiraId)}>
                  {isPending ? "Adicionando..." : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-2">
        {itens.length === 0 && <p className="text-sm text-muted-foreground">Nenhum item adicionado ainda.</p>}
        {itens.map((item) => {
          const info = origemInfo[item.origem];
          const Icon = info.icon;
          return (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-foreground">{item.descricao}</p>
                  <Badge variant={info.variant} className="shrink-0">
                    <Icon className="size-3" />
                    {item.loja_parceira_id ? (lojasPorId.get(item.loja_parceira_id) ?? info.label) : info.label}
                  </Badge>
                  {item.origem === "loja_parceira" && (
                    <Badge variant={item.pago_em ? "success" : "secondary"} className="shrink-0">
                      {item.pago_em ? "Pago ao parceiro" : "Pendente"}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.quantidade}x {formatCurrency(item.valor_unitario)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-foreground">
                  {formatCurrency(item.quantidade * item.valor_unitario)}
                </p>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Remover item"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {itens.length > 0 && (
        <div className="flex items-center justify-between border-t border-border pt-3">
          <p className="text-sm font-medium text-muted-foreground">Total em peças</p>
          <p className="text-sm font-bold text-foreground">{formatCurrency(total)}</p>
        </div>
      )}
    </div>
  );
}
