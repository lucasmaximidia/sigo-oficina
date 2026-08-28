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

const TEXTO_PADRAO = `Esta garantia refere-se exclusivamente ao serviço executado e à(s) peça(s) listada(s) acima, nesta ordem de serviço.

1. PRAZO
O prazo de validade é o indicado acima, contado a partir da data de entrega do equipamento ao cliente, conforme o Código de Defesa do Consumidor (Lei 8.078/90, art. 26, II).

2. COBERTURA
Esta garantia é do tipo: {TIPO_COBERTURA}, cobrindo exclusivamente os itens e serviços listados acima. Caso o mesmo problema volte a ocorrer dentro do prazo, o reparo será refeito sem custo adicional.

3. O QUE NÃO ESTÁ COBERTO
Esta garantia não cobre defeitos causados por:
- Mau uso, quedas, impactos, umidade, líquidos ou insetos;
- Oscilação ou queda de energia elétrica, raios ou instalação elétrica inadequada;
- Abertura, ajuste ou tentativa de reparo por terceiros não autorizados após a entrega;
- Desgaste natural de peças não substituídas nesta OS;
- Problema diferente do(s) item(ns) listado(s) acima.

4. COMO ACIONAR A GARANTIA
Para acionar a garantia, o cliente deve apresentar este certificado (ou informar o número da OS). O equipamento será reavaliado; confirmado que se trata do mesmo problema, o reparo é realizado sem custo.

5. PERDA DA GARANTIA
Esta garantia perde a validade caso o equipamento seja aberto, ajustado ou reparado por terceiros após a entrega, ou seja constatado uso inadequado do produto.`;

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
                preserveCase
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Variável disponível: {"{TIPO_COBERTURA}"} (puxa o tipo selecionado acima). O nome do cliente, o
                equipamento e o prazo já aparecem em campos próprios do certificado — não precisa repeti-los aqui.
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
