"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateConfiguracoesNfse } from "@/lib/actions";
import type { Configuracao } from "@/types";

export function NfseForm({ config }: { config: Configuracao }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateConfiguracoesNfse(formData);
        toast.success("Configurações de nota fiscal salvas");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="size-4.5 text-primary" />
          Nota Fiscal (NFS-e)
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Dados usados na emissão automática de NFS-e via Notaas. O certificado digital é cadastrado direto no painel
          da Notaas — não fica neste sistema.
        </p>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <label className="flex items-center gap-2.5">
            <Checkbox name="nfse_ativo" defaultChecked={config.nfse_ativo} />
            <span className="text-sm text-foreground">Emissão de nota fiscal ativa</span>
          </label>
          <p className="-mt-2.5 text-xs text-muted-foreground">
            Deixe desmarcado até ter o certificado digital e a chave da Notaas configurados (variável de ambiente
            NOTAAS_API_KEY) — enquanto isso, as notas continuam sendo lançadas como pendentes, sem tentar emitir.
          </p>

          <div className="border-t border-border pt-4">
            <label className="flex items-center gap-2.5">
              <Checkbox name="nfse_obrigatoria_cartao_pix" defaultChecked={config.nfse_obrigatoria_cartao_pix} />
              <span className="text-sm text-foreground">Nota fiscal obrigatória pra pagamento em cartão/PIX</span>
            </label>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Deixe desmarcado enquanto isso ainda não for exigido pela prefeitura. Com o cliente pagando em
              dinheiro, a nota continua sempre opcional (quem decide é o cliente), independente desse interruptor.
            </p>
          </div>

          <div className="max-w-xs">
            <Label htmlFor="nfse_codigo_servico" className="mb-1.5 block">
              Código do serviço (prefeitura)
            </Label>
            <Input id="nfse_codigo_servico" name="nfse_codigo_servico" defaultValue={config.nfse_codigo_servico ?? ""} />
          </div>

          <div className="max-w-xs">
            <Label htmlFor="nfse_aliquota_iss" className="mb-1.5 block">
              Alíquota de ISS (%)
            </Label>
            <Input
              id="nfse_aliquota_iss"
              name="nfse_aliquota_iss"
              inputMode="decimal"
              defaultValue={config.nfse_aliquota_iss ?? ""}
            />
          </div>

          <div>
            <Label htmlFor="nfse_descricao_padrao" className="mb-1.5 block">
              Descrição padrão do serviço
            </Label>
            <Textarea id="nfse_descricao_padrao" name="nfse_descricao_padrao" defaultValue={config.nfse_descricao_padrao} rows={3} />
            <p className="mt-1.5 text-xs text-muted-foreground">Aparece em todas as notas fiscais emitidas.</p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
