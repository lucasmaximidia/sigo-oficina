"use client";

import { X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { opcoesOrdenacaoPadrao, type Ordenacao } from "@/lib/filtro-ordenacao";

export function FiltroOrdenacaoBar({
  ordenacao,
  onOrdenacaoChange,
  periodoInicio,
  onPeriodoInicioChange,
  periodoFim,
  onPeriodoFimChange,
  opcoesOrdenacao = opcoesOrdenacaoPadrao,
}: {
  ordenacao: Ordenacao;
  onOrdenacaoChange: (value: Ordenacao) => void;
  periodoInicio: string;
  onPeriodoInicioChange: (value: string) => void;
  periodoFim: string;
  onPeriodoFimChange: (value: string) => void;
  opcoesOrdenacao?: { value: Ordenacao; label: string }[];
}) {
  const temFiltro = periodoInicio !== "" || periodoFim !== "";

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <Select value={ordenacao} onValueChange={(v) => onOrdenacaoChange(v as Ordenacao)}>
        <SelectTrigger className="w-auto min-w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {opcoesOrdenacao.map((opcao) => (
            <SelectItem key={opcao.value} value={opcao.value}>
              {opcao.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1.5">
        <Input
          type="date"
          value={periodoInicio}
          onChange={(e) => onPeriodoInicioChange(e.target.value)}
          className="w-auto"
          aria-label="Período de"
        />
        <span className="text-sm text-muted-foreground">até</span>
        <Input
          type="date"
          value={periodoFim}
          onChange={(e) => onPeriodoFimChange(e.target.value)}
          className="w-auto"
          aria-label="Período até"
        />
      </div>

      {temFiltro && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            onPeriodoInicioChange("");
            onPeriodoFimChange("");
          }}
        >
          <X className="size-3.5" />
          Limpar período
        </Button>
      )}
    </div>
  );
}
