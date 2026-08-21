"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Package, Store, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import type { OsItem, Peca, ItemOrigem } from "@/types";

const origemInfo: Record<ItemOrigem, { label: string; icon: typeof Package; variant: "secondary" | "info" | "warning" }> = {
  estoque: { label: "Estoque", icon: Package, variant: "secondary" },
  loja_parceira: { label: "Loja parceira", icon: Store, variant: "info" },
  compra_emergencial: { label: "Compra emergencial", icon: Zap, variant: "warning" },
};

export function OsItensList({ osId, itens, pecas }: { osId: string; itens: OsItem[]; pecas: Peca[] }) {
  const [open, setOpen] = useState(false);
  const [origem, setOrigem] = useState<ItemOrigem>("estoque");
  const [pecaId, setPecaId] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const pecaSelecionada = useMemo(() => pecas.find((p) => p.id === pecaId), [pecas, pecaId]);
  const total = itens.reduce((acc, i) => acc + i.quantidade * i.valor_unitario, 0);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await addOsItem(osId, formData);
        toast.success("Item adicionado");
        setOpen(false);
        setPecaId("");
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
                <Select name="origem" value={origem} onValueChange={(v) => setOrigem(v as ItemOrigem)}>
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

              {origem === "estoque" && (
                <div>
                  <Label className="mb-1.5 block">Peça do estoque</Label>
                  <Select
                    value={pecaId}
                    onValueChange={(v) => {
                      setPecaId(v);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma peça..." />
                    </SelectTrigger>
                    <SelectContent>
                      {pecas.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome} ({p.quantidade} em estoque)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="peca_id" value={pecaId} />
                </div>
              )}

              <div>
                <Label htmlFor="descricao" className="mb-1.5 block">
                  Descrição
                </Label>
                <Input
                  id="descricao"
                  name="descricao"
                  required
                  defaultValue={pecaSelecionada?.nome ?? ""}
                  placeholder="Ex: Mão de obra avulsa, correia, mangueira..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantidade" className="mb-1.5 block">
                    Quantidade
                  </Label>
                  <Input id="quantidade" name="quantidade" type="number" min={1} defaultValue={1} />
                </div>
                <div>
                  <Label htmlFor="valor_unitario" className="mb-1.5 block">
                    Valor unitário (R$)
                  </Label>
                  <Input
                    id="valor_unitario"
                    name="valor_unitario"
                    type="number"
                    step="0.01"
                    min={0}
                    defaultValue={pecaSelecionada?.preco_unitario ?? 0}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isPending}>
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
                    {info.label}
                  </Badge>
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
