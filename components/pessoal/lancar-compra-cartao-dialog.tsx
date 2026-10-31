"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createLancamentoCartao } from "@/lib/pessoal-actions";
import { PESSOAL_CARTAO_CATEGORIA_LABEL } from "@/lib/pessoal-status";
import type { PessoalCartao } from "@/types";

export function LancarCompraCartaoDialog({ cartoes, mes }: { cartoes: PessoalCartao[]; mes: string }) {
  const [open, setOpen] = useState(false);
  const [ehFixa, setEhFixa] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    formData.set("mes", mes);
    startTransition(async () => {
      try {
        await createLancamentoCartao(formData);
        toast.success("Compra lançada");
        setOpen(false);
        setEhFixa(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao lançar compra");
      }
    });
  }

  if (cartoes.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          <Plus className="size-4" />
          Lançar compra
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lançar compra no cartão</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label className="mb-1.5 block">Cartão</Label>
            <Select name="cartao_id" defaultValue={cartoes[0]?.id}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cartoes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="descricao" className="mb-1.5 block">
              Descrição
            </Label>
            <Input id="descricao" name="descricao" required placeholder="Ex: Supermercado, Farmácia..." className="uppercase" />
          </div>
          <div>
            <Label className="mb-1.5 block">Categoria</Label>
            <Select name="categoria" defaultValue="outros">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PESSOAL_CARTAO_CATEGORIA_LABEL).map(([valor, label]) => (
                  <SelectItem key={valor} value={valor}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valor_previsto" className="mb-1.5 block">
                Valor {ehFixa ? "" : "da parcela "}(R$)
              </Label>
              <NumericInput id="valor_previsto" name="valor_previsto" required />
            </div>
            <div>
              <Label htmlFor="parcela_total" className="mb-1.5 block">
                Parcelas
              </Label>
              <Input id="parcela_total" name="parcela_total" type="number" min={1} defaultValue={1} disabled={ehFixa} />
            </div>
          </div>
          <label className="flex items-center gap-2.5 text-sm text-foreground">
            <Checkbox name="eh_fixa" checked={ehFixa} onCheckedChange={(v) => setEhFixa(v === true)} />
            Conta fixa (repete todo mês — assinatura, seguro, mensalidade...)
          </label>
          <p className="text-xs text-muted-foreground">
            {ehFixa
              ? "Lança só este mês; use \"Copiar do mês anterior\" nos próximos pra repetir."
              : "Se for parcelado, lança automaticamente uma linha em cada mês seguinte, com o mesmo valor."}
          </p>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Lançar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
