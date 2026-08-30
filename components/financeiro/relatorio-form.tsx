"use client";

import { useState } from "react";
import { FileDown, FileBarChart } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { RELATORIO_COLUNAS, RELATORIO_OPCAO_RESUMO, RELATORIO_COLUNAS_PADRAO_POR_LOJA } from "@/lib/relatorio-financeiro";
import type { LojaParceira } from "@/types";

function primeiroDiaDoMes() {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10);
}

const TODAS_AS_CHAVES = [...RELATORIO_COLUNAS.map((c) => c.key), RELATORIO_OPCAO_RESUMO.key];

export function RelatorioForm({ lojas }: { lojas: LojaParceira[] }) {
  const [inicio, setInicio] = useState(primeiroDiaDoMes());
  const [fim, setFim] = useState(new Date().toISOString().slice(0, 10));
  const [lojaParceiraId, setLojaParceiraId] = useState<string>("todas");
  const [colunas, setColunas] = useState<Set<string>>(new Set(TODAS_AS_CHAVES));

  function toggleColuna(key: string) {
    setColunas((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleTodas(marcar: boolean) {
    setColunas(marcar ? new Set(TODAS_AS_CHAVES) : new Set());
  }

  function handleLojaChange(value: string) {
    setLojaParceiraId(value);
    const loja = lojas.find((l) => l.id === value);
    const preset = loja ? RELATORIO_COLUNAS_PADRAO_POR_LOJA[loja.nome] : undefined;
    if (preset) setColunas(new Set(preset));
  }

  function handleGerar() {
    if (colunas.size === 0) {
      toast.error("Selecione ao menos uma coluna para o relatório");
      return;
    }
    if (!inicio || !fim || inicio > fim) {
      toast.error("Verifique o período selecionado");
      return;
    }
    const params = new URLSearchParams({
      inicio,
      fim,
      colunas: Array.from(colunas).join(","),
    });
    if (lojaParceiraId !== "todas") params.set("loja", lojaParceiraId);
    window.open(`/api/financeiro/relatorio/pdf?${params.toString()}`, "_blank");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileBarChart className="size-4.5 text-primary" />
          Relatório de Serviços Realizados
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Escolha o período e quais colunas entram no PDF antes de gerar. O relatório considera as OS finalizadas com
          data de pagamento dentro do período escolhido.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:max-w-md">
          <div>
            <Label htmlFor="relatorio_inicio" className="mb-1.5 block">
              Período de
            </Label>
            <Input id="relatorio_inicio" type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="relatorio_fim" className="mb-1.5 block">
              até
            </Label>
            <Input id="relatorio_fim" type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
          </div>
        </div>

        <div className="sm:max-w-xs">
          <Label className="mb-1.5 block">Loja parceira</Label>
          <Select value={lojaParceiraId} onValueChange={handleLojaChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as lojas</SelectItem>
              {lojas.map((loja) => (
                <SelectItem key={loja.id} value={loja.id}>
                  {loja.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Escolha uma loja para listar só as OS com peças dela (útil para o fechamento mensal com o parceiro) — as
            colunas &quot;Valor Peças (Loja)&quot; e &quot;Itens Utilizados (Loja)&quot; passam a considerar só as
            peças dessa loja.
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label className="block">Colunas do relatório</Label>
            <div className="flex gap-2">
              <button type="button" onClick={() => toggleTodas(true)} className="text-xs font-medium text-primary hover:underline">
                Marcar todas
              </button>
              <span className="text-xs text-muted-foreground">·</span>
              <button type="button" onClick={() => toggleTodas(false)} className="text-xs font-medium text-primary hover:underline">
                Desmarcar todas
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {RELATORIO_COLUNAS.map((coluna) => (
              <label key={coluna.key} className="flex items-center gap-2.5">
                <Checkbox checked={colunas.has(coluna.key)} onCheckedChange={() => toggleColuna(coluna.key)} />
                <span className="text-sm text-foreground">{coluna.label}</span>
              </label>
            ))}
          </div>
          <div className="mt-3 border-t border-border pt-3">
            <label className="flex items-center gap-2.5">
              <Checkbox
                checked={colunas.has(RELATORIO_OPCAO_RESUMO.key)}
                onCheckedChange={() => toggleColuna(RELATORIO_OPCAO_RESUMO.key)}
              />
              <span className="text-sm text-foreground">{RELATORIO_OPCAO_RESUMO.label}</span>
            </label>
            <p className="mt-1 text-xs text-muted-foreground">
              Mostra os cartões de total recebido e faturamento da oficina no fim do PDF.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="button" onClick={handleGerar}>
            <FileDown className="size-4" />
            Gerar PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
