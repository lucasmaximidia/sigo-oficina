"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ChevronUp, ChevronDown, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EtiquetaPreview } from "./etiqueta-preview";
import { updateEtiquetaConfig } from "@/lib/actions";
import { ALTURAS_DISPONIVEIS_MM, CAMPOS_POR_TIPO, ETIQUETA_LARGURA_MM } from "@/lib/etiqueta-config";
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
          <Label className="block">Campos da etiqueta</Label>
          {config.campos.map((campo, index) => (
            <div key={campo.id} className="flex flex-wrap items-center gap-2.5 rounded-xl border border-border p-3">
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

              <span className="min-w-0 flex-1 text-sm font-medium text-foreground">{catalogo.get(campo.id) ?? campo.id}</span>

              <Select
                value={campo.alinhamento}
                onValueChange={(v) => atualizarCampo(campo.id, { alinhamento: v as EtiquetaAlinhamento })}
              >
                <SelectTrigger className="w-28 shrink-0">
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
                <SelectTrigger className="w-28 shrink-0">
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
          ))}
        </div>

        <Button type="button" onClick={handleSalvar} disabled={isPending} className="mt-1 w-fit">
          <Save className="size-4" />
          {isPending ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pré-visualização</p>
        <div className="sticky top-4 flex w-full justify-center rounded-2xl border border-dashed border-border bg-secondary/40 p-6">
          <div style={{ transform: "scale(0.75)", transformOrigin: "top center" }}>
            <EtiquetaPreview tipo={tipo} config={config} logoUrl={logoUrl} />
          </div>
        </div>
      </div>
    </div>
  );
}
