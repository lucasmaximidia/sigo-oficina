"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { BatteryCharging } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { salvarBateriaCarrinho } from "@/lib/locacao-dispositivos-actions";
import { TIPO_BATERIA_LABEL } from "@/lib/locacao-dispositivos-status";
import type { LocacaoTipoBateria } from "@/types";

const SUGESTAO: Record<LocacaoTipoBateria, { minima: string; aviso: string }> = {
  chumbo: { minima: "22,0", aviso: "23,0" },
  litio: { minima: "23,0", aviso: "24,0" },
  lifepo4: { minima: "24,0", aviso: "25,0" },
};

function sanitizeDecimal(raw: string) {
  const limpo = raw.replace(/[^0-9,.]/g, "").replace(".", ",");
  const [inteiro, ...resto] = limpo.split(",");
  return resto.length > 0 ? `${inteiro},${resto.join("").slice(0, 1)}` : inteiro;
}

function formatarVolts(v: number) {
  return v.toFixed(1).replace(".", ",");
}

export function BateriaCarrinhoDialog({
  dispositivoId,
  numeroCarrinho,
  tipoBateriaAtual,
  bateriaMinimaAtual,
  bateriaAvisoAtual,
  frotaMinima,
  frotaAviso,
}: {
  dispositivoId: string;
  numeroCarrinho: number;
  tipoBateriaAtual: LocacaoTipoBateria;
  bateriaMinimaAtual: number | null;
  bateriaAvisoAtual: number | null;
  frotaMinima: number;
  frotaAviso: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [tipo, setTipo] = useState<LocacaoTipoBateria>(tipoBateriaAtual);
  const [minimaText, setMinimaText] = useState(bateriaMinimaAtual != null ? formatarVolts(bateriaMinimaAtual) : "");
  const [avisoText, setAvisoText] = useState(bateriaAvisoAtual != null ? formatarVolts(bateriaAvisoAtual) : "");

  function resetar(aoAbrir: boolean) {
    setOpen(aoAbrir);
    if (aoAbrir) {
      setTipo(tipoBateriaAtual);
      setMinimaText(bateriaMinimaAtual != null ? formatarVolts(bateriaMinimaAtual) : "");
      setAvisoText(bateriaAvisoAtual != null ? formatarVolts(bateriaAvisoAtual) : "");
    }
  }

  function trocarTipo(novoTipo: LocacaoTipoBateria) {
    setTipo(novoTipo);
    const sugestao = SUGESTAO[novoTipo];
    if (window.confirm(`Preencher mínima e aviso com os valores sugeridos para ${TIPO_BATERIA_LABEL[novoTipo]} (${sugestao.minima} / ${sugestao.aviso})?`)) {
      setMinimaText(sugestao.minima);
      setAvisoText(sugestao.aviso);
    }
  }

  function usarValoresDaFrota() {
    setMinimaText("");
    setAvisoText("");
  }

  function salvar(formData: FormData) {
    startTransition(async () => {
      try {
        await salvarBateriaCarrinho(dispositivoId, formData);
        toast.success("Bateria do carrinho salva");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar bateria");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={resetar}>
      <DialogTrigger asChild>
        <button type="button" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
          <BatteryCharging className="size-3.5" />
          Bateria
        </button>
      </DialogTrigger>
      <DialogContent className="locacao-theme">
        <DialogHeader>
          <DialogTitle>Bateria do carrinho #{numeroCarrinho}</DialogTitle>
          <DialogDescription>
            Deixe os campos de limite em branco para usar os valores da frota (Configuração).
          </DialogDescription>
        </DialogHeader>
        <form action={salvar} className="flex flex-col gap-4">
          <input type="hidden" name="tipo_bateria" value={tipo} />
          <div>
            <Label htmlFor="tipo_bateria_select" className="mb-1.5 block">
              Tipo de bateria
            </Label>
            <Select value={tipo} onValueChange={(v) => trocarTipo(v as LocacaoTipoBateria)}>
              <SelectTrigger id="tipo_bateria_select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="locacao-theme">
                <SelectItem value="chumbo">Chumbo 24V</SelectItem>
                <SelectItem value="litio">Lítio 24V (7S)</SelectItem>
                <SelectItem value="lifepo4">LiFePO4 24V (8S)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bateria_minima" className="mb-1.5 block">
                Mínima (V)
              </Label>
              <Input
                id="bateria_minima"
                name="bateria_minima"
                inputMode="decimal"
                placeholder={`frota: ${formatarVolts(frotaMinima)}`}
                value={minimaText}
                onChange={(e) => setMinimaText(sanitizeDecimal(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="bateria_aviso" className="mb-1.5 block">
                Aviso (V)
              </Label>
              <Input
                id="bateria_aviso"
                name="bateria_aviso"
                inputMode="decimal"
                placeholder={`frota: ${formatarVolts(frotaAviso)}`}
                value={avisoText}
                onChange={(e) => setAvisoText(sanitizeDecimal(e.target.value))}
              />
            </div>
          </div>

          <Button type="button" variant="outline" size="sm" onClick={usarValoresDaFrota} className="self-start">
            Usar valores da frota
          </Button>

          <p className="text-xs text-muted-foreground">
            0 na mínima desliga o bloqueio de bateria fraca só neste carrinho (útil para testar na bancada com
            bateria de 21V). Lembre de apagar depois. O carrinho recebe a mudança na próxima vez que se conectar ao
            Wi-Fi da base.
          </p>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
