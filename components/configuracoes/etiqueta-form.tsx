"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateConfiguracoesEtiqueta } from "@/lib/actions";
import type { Configuracao } from "@/types";

export function EtiquetaForm({ config }: { config: Configuracao }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateConfiguracoesEtiqueta(formData);
        toast.success("Configurações de etiqueta salvas");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="size-4.5 text-primary" />
          Etiquetas
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Usado na etiqueta que você imprime e cola no equipamento ao abrir uma OS (formato 50x80mm, para impressoras
          térmicas de etiqueta). Usa a mesma logo e telefone configurados acima.
        </p>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="etiqueta_subtitulo" className="mb-1.5 block">
              Subtítulo (aparece abaixo do nome da empresa)
            </Label>
            <Input
              id="etiqueta_subtitulo"
              name="etiqueta_subtitulo"
              defaultValue={config.etiqueta_subtitulo}
              placeholder="Ex: Assistência técnica especializada"
            />
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
