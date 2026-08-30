"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { EyeOff, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateObservacoesOs } from "@/lib/actions";

export function OsObservacoes({ osId, observacoes }: { osId: string; observacoes: string | null }) {
  const [texto, setTexto] = useState(observacoes ?? "");
  const [isPending, startTransition] = useTransition();
  const alterado = texto !== (observacoes ?? "");

  function handleSalvar() {
    startTransition(async () => {
      try {
        await updateObservacoesOs(osId, texto);
        toast.success("Observações salvas");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar observações");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <EyeOff className="size-3.5 shrink-0" />
        Só a oficina vê isso — não aparece em impressões, etiquetas ou mensagens pro cliente.
      </p>
      <Textarea
        placeholder="Ex: cliente difícil de contatar, peça já foi trocada antes, combinou de pagar na retirada..."
        rows={5}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      <Button type="button" size="sm" className="self-end" onClick={handleSalvar} disabled={isPending || !alterado}>
        <Save className="size-4" />
        {isPending ? "Salvando..." : "Salvar observações"}
      </Button>
    </div>
  );
}
