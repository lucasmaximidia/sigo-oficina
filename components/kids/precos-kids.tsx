"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { Switch } from "@/components/ui/switch";
import { criarPrecoKids, salvarPrecoKids, alternarPrecoAtivo, removerPrecoKids } from "@/lib/kids-actions";
import { formatCurrency } from "@/lib/utils";
import type { KidsPreco } from "@/types";

function LinhaPreco({ preco }: { preco: KidsPreco }) {
  const [isPending, startTransition] = useTransition();
  const [editando, setEditando] = useState(false);

  function salvar(formData: FormData) {
    startTransition(async () => {
      try {
        await salvarPrecoKids(preco.id, formData);
        setEditando(false);
        toast.success("Preço atualizado");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar preço");
      }
    });
  }

  function alternarAtivo(ativo: boolean) {
    startTransition(async () => {
      try {
        await alternarPrecoAtivo(preco.id, ativo);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao atualizar preço");
      }
    });
  }

  function remover() {
    startTransition(async () => {
      try {
        await removerPrecoKids(preco.id);
        toast.success("Preço removido");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao remover preço");
      }
    });
  }

  if (editando) {
    return (
      <form action={salvar} className="flex flex-wrap items-end gap-3 rounded-lg border border-border p-3">
        <div className="w-28">
          <Label className="mb-1.5 block text-xs">Tempo (min)</Label>
          <NumericInput name="tempo_min" decimal={false} defaultValue={preco.tempo_min} required />
        </div>
        <div className="w-32">
          <Label className="mb-1.5 block text-xs">Valor (R$)</Label>
          <NumericInput name="valor" defaultValue={preco.valor} required />
        </div>
        <Button type="submit" size="sm" disabled={isPending}>
          Salvar
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setEditando(false)} disabled={isPending}>
          Cancelar
        </Button>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3 text-sm">
      <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setEditando(true)}>
        <p className="font-medium">{preco.tempo_min} min</p>
        <p className="text-xs text-muted-foreground">{formatCurrency(preco.valor)}</p>
      </button>
      <div className="flex items-center gap-2">
        <Switch checked={preco.ativo} onCheckedChange={alternarAtivo} disabled={isPending} />
        <span className="text-xs text-muted-foreground">{preco.ativo ? "Ativo" : "Inativo"}</span>
      </div>
      <button type="button" onClick={remover} disabled={isPending} className="text-muted-foreground hover:text-destructive disabled:opacity-50">
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

export function PrecosKids({ precos }: { precos: KidsPreco[] }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const ordenados = [...precos].sort((a, b) => a.tempo_min - b.tempo_min);

  function adicionar(formData: FormData) {
    startTransition(async () => {
      try {
        await criarPrecoKids(formData);
        toast.success("Preço adicionado");
        formRef.current?.reset();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao adicionar preço");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preços</CardTitle>
        <CardDescription>Tempo de uso e valor cobrado. Clique num preço pra editar.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-0">
        <div className="flex flex-col gap-2">
          {ordenados.map((preco) => (
            <LinhaPreco key={preco.id} preco={preco} />
          ))}
          {ordenados.length === 0 && <p className="text-sm text-muted-foreground">Nenhum preço cadastrado ainda.</p>}
        </div>

        <form ref={formRef} action={adicionar} className="flex flex-wrap items-end gap-3 border-t border-border pt-4">
          <div className="w-28">
            <Label htmlFor="tempo_min_novo" className="mb-1.5 block">
              Tempo (min)
            </Label>
            <NumericInput id="tempo_min_novo" name="tempo_min" decimal={false} required />
          </div>
          <div className="w-32">
            <Label htmlFor="valor_novo" className="mb-1.5 block">
              Valor (R$)
            </Label>
            <NumericInput id="valor_novo" name="valor" required />
          </div>
          <Button type="submit" disabled={isPending}>
            <Plus className="size-4" />
            Adicionar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
