"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
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
import { createPeca, updatePeca } from "@/lib/actions";
import type { LojaParceira, Peca } from "@/types";

export function PecaDialog({ peca, lojas }: { peca?: Peca; lojas: LojaParceira[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(peca);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (peca) {
          await updatePeca(peca.id, formData);
          toast.success("Peça atualizada");
        } else {
          await createPeca(formData);
          toast.success("Peça cadastrada");
        }
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar peça");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button size="icon" variant="ghost" aria-label="Editar peça">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" />
            Cadastrar Peça
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar peça" : "Cadastrar peça"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="nome" className="mb-1.5 block">
              Nome
            </Label>
            <Input
              id="nome"
              name="nome"
              required
              defaultValue={peca?.nome}
              placeholder="Ex: Correia de Transmissão V-12"
              className="uppercase"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="codigo" className="mb-1.5 block">
                Código
              </Label>
              <Input id="codigo" name="codigo" defaultValue={peca?.codigo ?? ""} className="uppercase" />
            </div>
            <div>
              <Label htmlFor="categoria" className="mb-1.5 block">
                Categoria
              </Label>
              <Input id="categoria" name="categoria" defaultValue={peca?.categoria ?? ""} className="uppercase" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantidade" className="mb-1.5 block">
                Estoque
              </Label>
              <NumericInput id="quantidade" name="quantidade" decimal={false} defaultValue={peca?.quantidade ?? 0} />
            </div>
            <div>
              <Label htmlFor="quantidade_minima" className="mb-1.5 block">
                Mínimo
              </Label>
              <NumericInput
                id="quantidade_minima"
                name="quantidade_minima"
                decimal={false}
                defaultValue={peca?.quantidade_minima ?? 2}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preco_custo" className="mb-1.5 block">
                Preço de Custo (R$)
              </Label>
              <NumericInput id="preco_custo" name="preco_custo" defaultValue={peca?.preco_custo ?? 0} />
            </div>
            <div>
              <Label htmlFor="preco_venda" className="mb-1.5 block">
                Preço de Venda (R$)
              </Label>
              <NumericInput id="preco_venda" name="preco_venda" defaultValue={peca?.preco_venda ?? 0} />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Fornecedor</Label>
            <Select name="fornecedor_id" defaultValue={peca?.fornecedor_id ?? undefined}>
              <SelectTrigger>
                <SelectValue placeholder="Nenhum" />
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
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
