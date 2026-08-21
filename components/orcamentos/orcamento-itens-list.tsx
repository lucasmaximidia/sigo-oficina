"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Package, Hammer } from "lucide-react";
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
import { addOrcamentoItem, removeOrcamentoItem } from "@/lib/actions";
import type { OrcamentoItem, Peca, OrcamentoItemTipo } from "@/types";

const tipoInfo: Record<OrcamentoItemTipo, { label: string; icon: typeof Package; variant: "secondary" | "info" }> = {
  peca: { label: "Peça", icon: Package, variant: "secondary" },
  mao_obra: { label: "Mão de obra", icon: Hammer, variant: "info" },
};

export function OrcamentoItensList({
  orcamentoId,
  itens,
  pecas,
  readOnly = false,
}: {
  orcamentoId: string;
  itens: OrcamentoItem[];
  pecas: Peca[];
  readOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<OrcamentoItemTipo>("peca");
  const [pecaId, setPecaId] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const pecaSelecionada = useMemo(() => pecas.find((p) => p.id === pecaId), [pecas, pecaId]);
  const total = itens.reduce((acc, i) => acc + i.quantidade * i.valor_unitario, 0);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await addOrcamentoItem(orcamentoId, formData);
        toast.success("Item adicionado");
        setOpen(false);
        setPecaId("");
        setTipo("peca");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao adicionar item");
      }
    });
  }

  function handleRemove(itemId: string) {
    startTransition(async () => {
      try {
        await removeOrcamentoItem(itemId, orcamentoId);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao remover item");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Peças e mão de obra</p>
        {!readOnly && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button type="button" size="sm" variant="secondary">
                <Plus className="size-4" />
                Adicionar item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar peça ou mão de obra</DialogTitle>
              </DialogHeader>
              <form action={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <Label className="mb-1.5 block">Tipo</Label>
                  <Select name="tipo" value={tipo} onValueChange={(v) => setTipo(v as OrcamentoItemTipo)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="peca">Peça</SelectItem>
                      <SelectItem value="mao_obra">Mão de obra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {tipo === "peca" && (
                  <div>
                    <Label className="mb-1.5 block">Peça do estoque (opcional)</Label>
                    <Select value={pecaId} onValueChange={setPecaId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar para preencher preço..." />
                      </SelectTrigger>
                      <SelectContent>
                        {pecas.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nome} ({formatCurrency(p.preco_venda)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    placeholder={tipo === "peca" ? "Ex: Correia de transmissão" : "Ex: Mão de obra - diagnóstico e reparo"}
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
                      defaultValue={pecaSelecionada?.preco_venda ?? 0}
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
        )}
      </div>

      <div className="flex flex-col gap-2">
        {itens.length === 0 && <p className="text-sm text-muted-foreground">Nenhum item adicionado ainda.</p>}
        {itens.map((item) => {
          const info = tipoInfo[item.tipo];
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
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remover item"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {itens.length > 0 && (
        <div className="flex items-center justify-between border-t border-border pt-3">
          <p className="text-sm font-medium text-muted-foreground">Total em itens</p>
          <p className="text-sm font-bold text-foreground">{formatCurrency(total)}</p>
        </div>
      )}
    </div>
  );
}
