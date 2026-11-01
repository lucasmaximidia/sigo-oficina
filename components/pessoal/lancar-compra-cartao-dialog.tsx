"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
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

function novoRateio() {
  return { key: crypto.randomUUID() };
}

export function LancarCompraCartaoDialog({
  cartoes,
  mes,
  cartaoIdPadrao,
}: {
  cartoes: PessoalCartao[];
  mes: string;
  cartaoIdPadrao?: string;
}) {
  const [open, setOpen] = useState(false);
  const [ehFixa, setEhFixa] = useState(false);
  const [rateios, setRateios] = useState([novoRateio()]);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setEhFixa(false);
      setRateios([novoRateio()]);
    }
  }

  function handleSubmit(formData: FormData) {
    formData.set("mes", mes);
    startTransition(async () => {
      try {
        await createLancamentoCartao(formData);
        toast.success("Compra lançada");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao lançar compra");
      }
    });
  }

  if (cartoes.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
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
            <Select name="cartao_id" defaultValue={cartaoIdPadrao ?? cartoes[0]?.id}>
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

          <div className="flex flex-col gap-3">
            {rateios.map((r, idx) => (
              <div key={r.key} className="flex items-end gap-2">
                <div className="flex-1">
                  {idx === 0 && <Label className="mb-1.5 block">Categoria</Label>}
                  <Select name="rateio_categoria" defaultValue="outros">
                    <SelectTrigger aria-label="Categoria do rateio">
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
                <div className="w-28 shrink-0">
                  {idx === 0 && (
                    <Label className="mb-1.5 block">Valor {ehFixa ? "" : "da parcela "}(R$)</Label>
                  )}
                  <NumericInput name="rateio_valor" required />
                </div>
                {rateios.length > 1 && (
                  <button
                    type="button"
                    aria-label="Remover categoria do rateio"
                    onClick={() => setRateios((rs) => rs.filter((x) => x.key !== r.key))}
                    className="mb-0.5 shrink-0 rounded-md p-2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="self-start"
              onClick={() => setRateios((rs) => [...rs, novoRateio()])}
            >
              <Plus className="size-3.5" />
              Dividir em outra categoria
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="parcela_atual" className="mb-1.5 block">
                Começando na parcela
              </Label>
              <Input id="parcela_atual" name="parcela_atual" type="number" min={1} defaultValue={1} disabled={ehFixa} />
            </div>
            <div>
              <Label htmlFor="parcela_total" className="mb-1.5 block">
                Total de parcelas
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
              : "Se for parcelado, lança automaticamente uma linha em cada mês seguinte, com o mesmo valor. Se a compra já começou antes (ex: já tá na 2ª de 5), mude \"Começando na parcela\" — só lança as que faltam. Se dividir em mais de uma categoria, as parcelas valem pra cada uma."}
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
