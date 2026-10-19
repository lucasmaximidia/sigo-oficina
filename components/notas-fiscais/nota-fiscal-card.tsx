"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FileText, RefreshCw, Ban, Receipt, Wrench, ShoppingCart, FileSignature } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { notaFiscalStatusMap, notaFiscalMotivoLabel } from "@/lib/notas-fiscais";
import { reemitirNotaFiscal, cancelarNotaFiscalAction, marcarNotaFiscalComoDesejada } from "@/lib/notas-fiscais-actions";
import type { NotaFiscal } from "@/types";

const origemInfo: Record<NotaFiscal["origem"], { label: string; icon: typeof Wrench }> = {
  os: { label: "Ordem de Serviço", icon: Wrench },
  venda_pdv: { label: "Venda PDV", icon: ShoppingCart },
  avulsa: { label: "Nota Avulsa", icon: FileSignature },
};

export function NotaFiscalCard({ nota }: { nota: NotaFiscal }) {
  const [isPending, startTransition] = useTransition();
  const status = notaFiscalStatusMap[nota.status];
  const origem = origemInfo[nota.origem];
  const OrigemIcon = origem.icon;
  const href = nota.os_id ? `/ordens-servico/${nota.os_id}` : null;

  function reemitir() {
    startTransition(async () => {
      try {
        await reemitirNotaFiscal(nota.id);
        toast.success("Reenviado para emissão");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao reemitir nota fiscal");
      }
    });
  }

  function cancelar() {
    startTransition(async () => {
      try {
        await cancelarNotaFiscalAction(nota.id, "Cancelada pelo operador");
        toast.success("Nota fiscal cancelada");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao cancelar nota fiscal");
      }
    });
  }

  function marcarDesejada() {
    startTransition(async () => {
      try {
        await marcarNotaFiscalComoDesejada(nota.id);
        toast.success("Nota fiscal em processamento");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao emitir nota fiscal");
      }
    });
  }

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{nota.cliente_nome}</p>
          <p className="text-xs text-muted-foreground">{formatDateTime(nota.created_at)}</p>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <OrigemIcon className="size-3.5" />
          {href ? (
            <Link href={href} className="hover:text-foreground hover:underline">
              {origem.label}
            </Link>
          ) : (
            origem.label
          )}
        </span>
        <span className="text-base font-semibold text-foreground">{formatCurrency(nota.valor)}</span>
      </div>

      <p className="text-xs text-muted-foreground">{notaFiscalMotivoLabel[nota.motivo]}</p>

      {nota.status === "erro" && nota.erro_mensagem && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive">
          {nota.erro_mensagem}
        </p>
      )}

      {nota.numero_nfse && <p className="text-xs text-muted-foreground">Nota nº {nota.numero_nfse}</p>}

      <div className="flex flex-wrap gap-2 border-t border-border pt-3">
        {nota.url_pdf && (
          <Button asChild type="button" variant="outline" size="sm">
            <a href={nota.url_pdf} target="_blank" rel="noopener noreferrer">
              <FileText className="size-3.5" />
              Ver PDF
            </a>
          </Button>
        )}
        {(nota.status === "erro" || nota.status === "pendente") && (
          <Button type="button" variant="outline" size="sm" onClick={reemitir} disabled={isPending}>
            <RefreshCw className="size-3.5" />
            {isPending ? "Enviando..." : "Reemitir"}
          </Button>
        )}
        {nota.status === "emitida" && (
          <Button type="button" variant="outline" size="sm" onClick={cancelar} disabled={isPending}>
            <Ban className="size-3.5" />
            Cancelar
          </Button>
        )}
        {nota.status === "nao_emitir" && (
          <Button type="button" variant="outline" size="sm" onClick={marcarDesejada} disabled={isPending}>
            <Receipt className="size-3.5" />
            Cliente mudou de ideia, emitir
          </Button>
        )}
      </div>
    </Card>
  );
}
