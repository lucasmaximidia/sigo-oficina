import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EtiquetaLogoUpload } from "@/components/configuracoes/etiqueta-logo-upload";
import { EtiquetaConfigForm } from "@/components/configuracoes/etiquetas/etiqueta-config-form";
import { normalizarEtiquetaConfig, ETIQUETA_TIPO_LABEL } from "@/lib/etiqueta-config";
import type { EtiquetaTipo } from "@/types";

export const dynamic = "force-dynamic";

const TIPOS: EtiquetaTipo[] = ["peca", "os", "autorizada"];

export default async function ConfiguracoesEtiquetasPage() {
  const { data: config } = await supabase
    .from("configuracoes")
    .select("etiqueta_logo_url, etiqueta_peca_config, etiqueta_os_config, etiqueta_autorizada_config")
    .eq("id", 1)
    .single();

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/configuracoes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar para Configurações
      </Link>
      <PageHeader
        title="Etiquetas"
        description="Personalize o logo, o tamanho e os campos de cada etiqueta impressa pelo sistema. As alterações aparecem na pré-visualização antes de salvar."
      />

      <div className="flex flex-col gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Logo da etiqueta</CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="mb-1.5 block">Imagem exibida no topo das 3 etiquetas (quando ativada)</Label>
            <EtiquetaLogoUpload logoUrl={config?.etiqueta_logo_url ?? null} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <Tabs defaultValue="peca">
              <TabsList>
                {TIPOS.map((tipo) => (
                  <TabsTrigger key={tipo} value={tipo}>
                    {ETIQUETA_TIPO_LABEL[tipo]}
                  </TabsTrigger>
                ))}
              </TabsList>
              {TIPOS.map((tipo) => (
                <TabsContent key={tipo} value={tipo} className="pt-4">
                  <EtiquetaConfigForm
                    tipo={tipo}
                    configInicial={normalizarEtiquetaConfig(tipo, config?.[`etiqueta_${tipo}_config`] ?? null)}
                    logoUrl={config?.etiqueta_logo_url ?? null}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
