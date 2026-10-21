"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { FileText, RefreshCw, Ban, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  criarNotaFiscalParaOs,
  reemitirNotaFiscal,
  cancelarNotaFiscalAction,
  marcarNotaFiscalComoDesejada,
} from "@/lib/notas-fiscais-actions";
import { nfseObrigatoria, notaFiscalStatusMap } from "@/lib/notas-fiscais";
import type { FormaPagamento, NotaFiscal, OsStatus } from "@/types";

export function OsNotaFiscal({
  osId,
  status,
  total,
  formasPagamento,
  nota,
  nfseObrigatoriaAtiva,
}: {
  osId: string;
  status: OsStatus;
  total: number;
  formasPagamento: FormaPagamento[];
  nota: NotaFiscal | null;
  nfseObrigatoriaAtiva: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  if (status !== "finalizado") {
    return <p className="text-sm text-muted-foreground">Disponível depois que a OS for finalizada.</p>;
  }
  if (total <= 0) {
    return <p className="text-sm text-muted-foreground">Sem valor lançado nessa OS — nada a notear.</p>;
  }

  function decidir(desejaNota: boolean | null) {
    startTransition(async () => {
      try {
        await criarNotaFiscalParaOs(osId, desejaNota);
        toast.success(desejaNota === false ? "Registrado: cliente não quis nota fiscal" : "Nota fiscal em processamento");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao lançar nota fiscal");
      }
    });
  }

  function reemitir() {
    if (!nota) return;
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
    if (!nota) return;
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
    if (!nota) return;
    startTransition(async () => {
      try {
        await marcarNotaFiscalComoDesejada(nota.id);
        toast.success("Nota fiscal em processamento");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao emitir nota fiscal");
      }
    });
  }

  if (nota) {
    const info = notaFiscalStatusMap[nota.status];
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={info.variant}>{info.label}</Badge>
          {nota.numero_nfse && <span className="text-sm text-muted-foreground">Nº {nota.numero_nfse}</span>}
        </div>
        {nota.status === "erro" && nota.erro_mensagem && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {nota.erro_mensagem}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
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
              Cancelar nota
            </Button>
          )}
          {nota.status === "nao_emitir" && (
            <Button type="button" variant="outline" size="sm" onClick={marcarDesejada} disabled={isPending}>
              <Receipt className="size-3.5" />
              Cliente pediu a nota, emitir agora
            </Button>
          )}
        </div>
      </div>
    );
  }

  const obrigatoria = nfseObrigatoria(formasPagamento, nfseObrigatoriaAtiva);
  if (obrigatoria) {
    return (
      <div className="flex flex-col gap-2.5">
        <p className="text-sm text-foreground">Obrigatória — pagamento em cartão ou PIX exige emissão de nota fiscal.</p>
        <Button type="button" size="sm" onClick={() => decidir(null)} disabled={isPending} className="self-start">
          <Receipt className="size-3.5" />
          {isPending ? "Emitindo..." : "Emitir nota fiscal"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-sm text-muted-foreground">Pagamento em dinheiro — o cliente quer nota fiscal?</p>
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={() => decidir(true)} disabled={isPending}>
          Sim
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => decidir(false)} disabled={isPending}>
          Não
        </Button>
      </div>
    </div>
  );
}
