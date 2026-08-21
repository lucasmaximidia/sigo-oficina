"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { updateConfiguracoesEmpresa } from "@/lib/actions";
import { LogoUpload } from "./logo-upload";
import type { Configuracao } from "@/types";

export function EmpresaForm({ config }: { config: Configuracao }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateConfiguracoesEmpresa(formData);
        toast.success("Dados da empresa salvos");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar dados");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="size-4.5 text-primary" />
          Dados da Empresa
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Estas informações aparecerão nos cabeçalhos de orçamentos, ordens de serviço impressas e relatórios para os clientes.
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-5">
          <Label className="mb-2 block">Logo da Empresa</Label>
          <LogoUpload logoUrl={config.logo_url} />
        </div>
        <Separator className="mb-5" />
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="nome_empresa" className="mb-1.5 block">
              Nome Fantasia / Razão Social
            </Label>
            <Input id="nome_empresa" name="nome_empresa" defaultValue={config.nome_empresa} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cnpj" className="mb-1.5 block">
                CNPJ
              </Label>
              <Input id="cnpj" name="cnpj" defaultValue={config.cnpj ?? ""} />
            </div>
            <div>
              <Label htmlFor="telefone" className="mb-1.5 block">
                Telefone de Contato
              </Label>
              <Input id="telefone" name="telefone" defaultValue={config.telefone ?? ""} />
            </div>
          </div>
          <div>
            <Label htmlFor="endereco" className="mb-1.5 block">
              Endereço Completo
            </Label>
            <Input id="endereco" name="endereco" defaultValue={config.endereco ?? ""} />
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
