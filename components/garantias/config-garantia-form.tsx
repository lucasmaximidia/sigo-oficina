"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Save, ShieldCheck, FileText, Bell, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateConfiguracoesGarantia } from "@/lib/actions";
import type { Configuracao } from "@/types";

const TEXTO_PADRAO = `TERMO DE GARANTIA

A SIGO Oficina assegura ao cliente a garantia sobre os serviços prestados e peças substituídas, conforme as seguintes condições:

1. PRAZO: O prazo de validade desta garantia é de {PRAZO_DIAS} dias, contados a partir da data de entrega do equipamento ao cliente, conforme determinação legal (CDC, art. 26, II).`;

export function ConfigGarantiaForm({ config }: { config: Configuracao }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateConfiguracoesGarantia(formData);
        toast.success("Configurações de garantia salvas");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar configurações");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Save className="size-4" />
          {isPending ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-4.5 text-primary" />
                Prazo Padrão de Garantia
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="garantia_prazo_dias" className="mb-1.5 block">
                  Duração (dias)
                </Label>
                <NumericInput
                  id="garantia_prazo_dias"
                  name="garantia_prazo_dias"
                  decimal={false}
                  defaultValue={config.garantia_prazo_dias}
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Tipo de Cobertura Padrão</Label>
                <Select name="garantia_tipo_cobertura" defaultValue={config.garantia_tipo_cobertura}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Garantia Total (Peças e Mão de Obra)">Garantia Total (Peças e Mão de Obra)</SelectItem>
                    <SelectItem value="Apenas Mão de Obra">Apenas Mão de Obra</SelectItem>
                    <SelectItem value="Apenas Peças">Apenas Peças</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-4.5 text-primary" />
                Texto Padrão de Garantia
              </CardTitle>
              <p className="text-xs text-muted-foreground">Termos legais que constarão no certificado gerado para o cliente.</p>
            </CardHeader>
            <CardContent>
              <Textarea
                name="garantia_texto_padrao"
                rows={8}
                defaultValue={config.garantia_texto_padrao ?? TEXTO_PADRAO}
                className="font-mono text-xs"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Variáveis disponíveis: {"{CLIENTE_NOME}"}, {"{EQUIPAMENTO}"}, {"{PRAZO_DIAS}"}, {"{DATA_SERVICO}"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="size-4.5 text-primary" />
                Alertas de Vencimento
              </CardTitle>
              <p className="text-xs text-muted-foreground">Configure quando o sistema deve avisar sobre garantias próximas do fim.</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <Label htmlFor="garantia_alerta_dias" className="mb-1.5 block">
                  Aviso Antecipado (dias)
                </Label>
                <NumericInput
                  id="garantia_alerta_dias"
                  name="garantia_alerta_dias"
                  decimal={false}
                  defaultValue={config.garantia_alerta_dias}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="size-4.5 text-primary" />
                Certificado
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <label className="flex items-center gap-2.5">
                <Checkbox name="garantia_assinatura_digital" defaultChecked={config.garantia_assinatura_digital} />
                <span className="text-sm text-foreground">Exibir linha para assinatura do técnico</span>
              </label>
              <label className="flex items-center gap-2.5">
                <Checkbox name="garantia_qrcode" defaultChecked={config.garantia_qrcode} />
                <span className="text-sm text-foreground">Gerar QR Code de validação</span>
              </label>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
