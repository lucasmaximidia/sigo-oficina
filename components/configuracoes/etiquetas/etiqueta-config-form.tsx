"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ChevronUp, ChevronDown, Columns2, Link2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EtiquetaPreview } from "./etiqueta-preview";
import { updateEtiquetaConfig } from "@/lib/actions";
import { ALTURAS_DISPONIVEIS_MM, CAMPOS_POR_TIPO, ETIQUETA_LARGURA_MM, ETIQUETA_PX_POR_MM } from "@/lib/etiqueta-config";
import type { EtiquetaAlinhamento, EtiquetaCampoConfig, EtiquetaTamanhoFonte, EtiquetaTipo, EtiquetaTipoConfig } from "@/types";

const ALINHAMENTO_LABEL: Record<EtiquetaAlinhamento, string> = {
  left: "Esquerda",
  center: "Centro",
  right: "Direita",
};

const TAMANHO_FONTE_LABEL: Record<EtiquetaTamanhoFonte, string> = {
  pequena: "Pequena",
  media: "Média",
  grande: "Grande",
};

export function EtiquetaConfigForm({
  tipo,
  configInicial,
  logoUrl,
}: {
  tipo: EtiquetaTipo;
  configInicial: EtiquetaTipoConfig;
  logoUrl: string | null;
}) {
  const [config, setConfig] = useState(configInicial);
  const [isPending, startTransition] = useTransition();
  const catalogo = new Map(CAMPOS_POR_TIPO[tipo].map((c) => [c.id, c.label]));

  function atualizarCampo(id: string, patch: Partial<EtiquetaCampoConfig>) {
    setConfig((prev) => ({
      ...prev,
      campos: prev.campos.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }

  function moverCampo(index: number, direcao: -1 | 1) {
    setConfig((prev) => {
      const campos = [...prev.campos];
      const destino = index + direcao;
      if (destino < 0 || destino >= campos.length) return prev;
      [campos[index], campos[destino]] = [campos[destino], campos[index]];
      return { ...prev, campos };
    });
  }

  function handleSalvar() {
    startTransition(async () => {
      try {
        await updateEtiquetaConfig(tipo, config);
        toast.success("Configuração da etiqueta salva");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar configuração");
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <Switch
            id={`mostrar-logo-${tipo}`}
            checked={config.mostrarLogo}
            onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, mostrarLogo: checked }))}
          />
          <Label htmlFor={`mostrar-logo-${tipo}`} className="text-sm text-muted-foreground">
            Mostrar logo no topo da etiqueta
          </Label>
        </div>

        <div className="max-w-xs">
          <Label className="mb-1.5 block">Tamanho da etiqueta</Label>
          <Select
            value={String(config.alturaMm)}
            onValueChange={(v) => setConfig((prev) => ({ ...prev, alturaMm: Number(v) }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALTURAS_DISPONIVEIS_MM.map((altura) => (
                <SelectItem key={altura} value={String(altura)}>
                  {ETIQUETA_LARGURA_MM} x {altura}mm
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1.5 text-xs text-muted-foreground">
            A largura é fixa em {ETIQUETA_LARGURA_MM}mm (limite da impressora térmica) — só a altura muda.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="block">Campos da etiqueta</Label>
            <span className="font-mono text-[11px] tracking-wide text-muted-foreground">
              {config.campos.filter((c) => c.visivel).length}/{config.campos.length} ativos
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Use <Columns2 className="inline size-3.5 align-text-bottom" /> para colocar um campo na mesma linha do
            próximo (lado a lado).
          </p>
          {config.campos.map((campo, index) => (
            <div
              key={campo.id}
              className={`rounded-xl border p-3 transition-colors ${
                campo.compartilharLinha ? "border-primary/40 bg-primary/[0.03]" : "border-border"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="hidden shrink-0 font-mono text-[11px] text-muted-foreground/70 sm:inline">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="flex flex-col">
                  <button
                    type="button"
                    aria-label="Mover para cima"
                    disabled={index === 0}
                    onClick={() => moverCampo(index, -1)}
                    className="text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ChevronUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Mover para baixo"
                    disabled={index === config.campos.length - 1}
                    onClick={() => moverCampo(index, 1)}
                    className="text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ChevronDown className="size-4" />
                  </button>
                </div>

                <Switch
                  checked={campo.visivel}
                  onCheckedChange={(checked) => atualizarCampo(campo.id, { visivel: checked })}
                  aria-label={`Mostrar ${catalogo.get(campo.id)}`}
                />

                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {catalogo.get(campo.id) ?? campo.id}
                </span>

                <button
                  type="button"
                  aria-label={
                    campo.compartilharLinha ? "Não dividir linha com o próximo campo" : "Dividir linha com o próximo campo"
                  }
                  aria-pressed={campo.compartilharLinha}
                  title="Colocar na mesma linha do próximo campo"
                  disabled={index === config.campos.length - 1}
                  onClick={() => atualizarCampo(campo.id, { compartilharLinha: !campo.compartilharLinha })}
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors disabled:pointer-events-none disabled:opacity-30 ${
                    campo.compartilharLinha
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Columns2 className="size-4" />
                </button>
              </div>

              <div className="mt-2.5 flex items-center gap-2 pl-[3.75rem]">
                <Select
                  value={campo.alinhamento}
                  onValueChange={(v) => atualizarCampo(campo.id, { alinhamento: v as EtiquetaAlinhamento })}
                >
                  <SelectTrigger className="h-9 flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ALINHAMENTO_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={campo.tamanhoFonte}
                  onValueChange={(v) => atualizarCampo(campo.id, { tamanhoFonte: v as EtiquetaTamanhoFonte })}
                >
                  <SelectTrigger className="h-9 flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TAMANHO_FONTE_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {campo.compartilharLinha && (
                <p className="mt-2 flex items-center gap-1 pl-[3.75rem] text-[11px] font-medium text-primary">
                  <Link2 className="size-3" />
                  Nesta linha com o próximo campo visível
                </p>
              )}
            </div>
          ))}
        </div>

        <Button type="button" onClick={handleSalvar} disabled={isPending} className="mt-1 w-fit">
          <Save className="size-4" />
          {isPending ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success/60" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pré-visualização ao vivo</p>
        </div>
        <div className="sticky top-4 w-full rounded-[1.75rem] bg-[#12141f] p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between px-1">
            <div className="flex gap-1.5">
              <span className="size-2 rounded-full bg-white/15" />
              <span className="size-2 rounded-full bg-white/15" />
              <span className="size-2 rounded-full bg-success" />
            </div>
            <span className="font-mono text-[10px] tracking-wider text-white/40">TERM-50MM</span>
          </div>
          <div className="flex justify-center rounded-2xl bg-white/[0.04] p-6">
            <div style={{ transform: "scale(0.75)", transformOrigin: "top center" }}>
              <EtiquetaPreview tipo={tipo} config={config} logoUrl={logoUrl} />
            </div>
          </div>
          <p className="mt-4 text-center font-mono text-[10px] tracking-wider text-white/35">
            {ETIQUETA_LARGURA_MM}×{config.alturaMm}mm · {ETIQUETA_LARGURA_MM * ETIQUETA_PX_POR_MM}×
            {config.alturaMm * ETIQUETA_PX_POR_MM}px
          </p>
        </div>
      </div>
    </div>
  );
}
