"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Send, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { gerarLinkRenovacao } from "@/lib/locacao-actions";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export function RenovarAluguelDialog({
  aluguelId,
  clienteNome,
  clienteTelefone,
  valorDiaria,
  open,
  onOpenChange,
}: {
  aluguelId: string;
  clienteNome: string;
  clienteTelefone: string | null;
  valorDiaria: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [dias, setDias] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [resultado, setResultado] = useState<{ token: string; valorAdicional: number; novaData: string } | null>(null);

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setDias(1);
      setResultado(null);
    }
  }

  function gerar() {
    startTransition(async () => {
      try {
        const r = await gerarLinkRenovacao(aluguelId, dias);
        setResultado(r);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao gerar link de renovação");
      }
    });
  }

  const link = resultado && typeof window !== "undefined" ? `${window.location.origin}/locacao/renovar/${resultado.token}` : "";

  function copiarLink() {
    navigator.clipboard.writeText(link);
    toast.success("Link copiado");
  }

  function enviarWhatsapp() {
    if (!resultado) return;
    const telefone = clienteTelefone?.replace(/\D/g, "");
    const mensagem = encodeURIComponent(
      `Olá ${clienteNome}! Seu aluguel pode ser renovado por mais ${dias} dia${dias === 1 ? "" : "s"} (+${formatCurrency(resultado.valorAdicional)}). Pra confirmar, abra o link e clique em "Aceitar renovação": ${link}\n\nVálido por 24h.`
    );
    const url = telefone ? `https://wa.me/55${telefone}?text=${mensagem}` : `https://wa.me/?text=${mensagem}`;
    window.open(url, "_blank");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="locacao-theme">
        <DialogHeader>
          <DialogTitle>Renovar aluguel</DialogTitle>
          <DialogDescription>
            {resultado
              ? "Link gerado — mande pro cliente aceitar sem precisar voltar na loja."
              : "Gere um link pro cliente aceitar a renovação sozinho, sem precisar voltar na loja."}
          </DialogDescription>
        </DialogHeader>

        {!valorDiaria && (
          <p className="text-sm text-muted-foreground">
            Cadastre o valor da diária desse veículo antes de gerar o link de renovação.
          </p>
        )}

        {valorDiaria != null && !resultado && (
          <div>
            <Label htmlFor="dias_adicionais" className="mb-1.5 block">
              Quantos dias adicionar?
            </Label>
            <NumericInput
              id="dias_adicionais"
              decimal={false}
              value={dias}
              onValueChange={(v) => setDias(Math.max(1, v))}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Valor adicional: <span className="font-medium text-foreground">{formatCurrency(dias * valorDiaria)}</span>
            </p>
          </div>
        )}

        {resultado && (
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-3">
            <div className="flex items-start gap-2 text-sm text-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
              <p>
                Nova devolução <span className="font-medium">{formatDateTime(resultado.novaData)}</span> · valor adicional{" "}
                <span className="font-medium">{formatCurrency(resultado.valorAdicional)}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-md border border-border bg-card px-2 py-1.5 text-xs text-muted-foreground">
                {link}
              </code>
              <Button type="button" variant="outline" size="icon" onClick={copiarLink} title="Copiar link">
                <Copy className="size-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">O link expira em 24 horas.</p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          {!resultado ? (
            <Button type="button" disabled={isPending || !valorDiaria} onClick={gerar} className="gap-2">
              Gerar link
            </Button>
          ) : (
            <Button type="button" onClick={enviarWhatsapp} className="gap-2">
              <Send className="size-4" />
              Enviar no WhatsApp
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
