import { Tag } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EtiquetaLogoUpload } from "./etiqueta-logo-upload";
import type { Configuracao } from "@/types";

export function EtiquetaForm({ config }: { config: Configuracao }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="size-4.5 text-primary" />
          Etiquetas
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Usado na etiqueta que você imprime e cola no equipamento ao abrir uma OS (formato 50x80mm, para impressoras
          térmicas de etiqueta).
        </p>
      </CardHeader>
      <CardContent>
        <div>
          <Label className="mb-1.5 block">Logo da etiqueta</Label>
          <EtiquetaLogoUpload logoUrl={config.etiqueta_logo_url} />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Essa imagem preenche todo o cabeçalho da etiqueta (sem nenhum texto sobreposto). Tamanho ideal:{" "}
            <strong>500 x 240px</strong>, exatamente nessa proporção — o próprio arquivo já deve trazer o nome da
            empresa e qualquer outra informação que você queira no topo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
