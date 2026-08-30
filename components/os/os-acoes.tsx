"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Printer, MessageCircle, CheckCircle2, ShieldCheck, Tag, Trash2, Ban, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { updateOrdemServicoStatus, deleteOrdemServico, reabrirOrdemServico } from "@/lib/actions";
import type { OsStatus } from "@/types";

export function OsAcoes({
  osId,
  status,
  numero,
  clienteNome,
  clienteTelefone,
  total,
  saldoDevedor,
  temEmpresaAutorizada,
}: {
  osId: string;
  status: OsStatus;
  numero: number;
  clienteNome: string;
  clienteTelefone: string | null;
  total: number;
  saldoDevedor: number;
  temEmpresaAutorizada: boolean;
}) {
  const router = useRouter();
  const [confirmarFinalizar, setConfirmarFinalizar] = useState(false);
  const [confirmarExcluir, setConfirmarExcluir] = useState(false);
  const [confirmarCancelar, setConfirmarCancelar] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [isCancelando, startCancelar] = useTransition();
  const [isReabrindo, startReabrir] = useTransition();

  function handleWhatsapp() {
    const telefone = clienteTelefone?.replace(/\D/g, "");
    const mensagem = encodeURIComponent(
      `Olá ${clienteNome}, aqui é da oficina. Sua OS #OS-${String(numero).padStart(4, "0")} está com o total de ${formatCurrency(total)}. Qualquer dúvida estamos à disposição!`
    );
    const url = telefone ? `https://wa.me/55${telefone}?text=${mensagem}` : `https://wa.me/?text=${mensagem}`;
    window.open(url, "_blank");
  }

  function handleFinalizar() {
    startTransition(async () => {
      try {
        await updateOrdemServicoStatus(osId, "finalizado");
        toast.success("Ordem finalizada! A garantia começa a contar a partir da retirada do equipamento.");
        setConfirmarFinalizar(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao finalizar OS");
      }
    });
  }

  function handleExcluir() {
    startDelete(async () => {
      try {
        await deleteOrdemServico(osId);
        toast.success("Ordem de serviço excluída");
        router.push("/ordens-servico");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao excluir OS");
      }
    });
  }

  function handleCancelar() {
    startCancelar(async () => {
      try {
        await updateOrdemServicoStatus(osId, "cancelado");
        toast.success("Ordem de serviço cancelada");
        setConfirmarCancelar(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao cancelar OS");
      }
    });
  }

  function handleReabrir() {
    startReabrir(async () => {
      try {
        await reabrirOrdemServico(osId);
        toast.success("Ordem de serviço reaberta");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao reabrir OS");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
      <div className="flex flex-wrap gap-2.5">
        <Button asChild variant="outline">
          <a href={`/api/ordens-servico/${osId}/pdf`} target="_blank" rel="noopener noreferrer">
            <Printer className="size-4" />
            Imprimir OS
          </a>
        </Button>
        <Button type="button" variant="secondary" onClick={handleWhatsapp}>
          <MessageCircle className="size-4" />
          Compartilhar no WhatsApp
        </Button>

        <Button asChild variant="outline">
          <a href={`/api/ordens-servico/${osId}/etiqueta`} target="_blank" rel="noopener noreferrer">
            <Tag className="size-4" />
            Baixar Etiqueta (PNG)
          </a>
        </Button>

        {temEmpresaAutorizada && (
          <Button asChild variant="outline">
            <a href={`/api/ordens-servico/${osId}/etiqueta-autorizada`} target="_blank" rel="noopener noreferrer">
              <Tag className="size-4" />
              Baixar Etiqueta Autorizada (PNG)
            </a>
          </Button>
        )}

        {status === "finalizado" && (
          <Button asChild variant="outline">
            <a href={`/api/garantias/${osId}/certificado`} target="_blank" rel="noopener noreferrer">
              <ShieldCheck className="size-4" />
              Baixar Certificado de Garantia
            </a>
          </Button>
        )}

        <Dialog open={confirmarFinalizar} onOpenChange={setConfirmarFinalizar}>
          <DialogTrigger asChild>
            <Button type="button" disabled={status === "finalizado" || status === "cancelado"}>
              <CheckCircle2 className="size-4" />
              {status === "finalizado" ? "Ordem finalizada" : "Finalizar Ordem"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Finalizar ordem de serviço?</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              {saldoDevedor > 0.01 ? (
                <p className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm text-warning">
                  Ainda falta receber {formatCurrency(saldoDevedor)} dessa OS. Você pode finalizar mesmo assim e
                  registrar o pagamento depois, na seção Pagamentos.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Total: <span className="font-semibold text-foreground">{formatCurrency(total)}</span> — já quitado.
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Ao confirmar, a OS é finalizada. A garantia passa a contar a partir da data de retirada do equipamento
                (informe-a depois, quando o cliente buscar).
              </p>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleFinalizar} disabled={isPending}>
                {isPending ? "Finalizando..." : "Confirmar e finalizar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {(status === "finalizado" || status === "cancelado") && (
          <Button type="button" variant="outline" onClick={handleReabrir} disabled={isReabrindo}>
            <RotateCcw className="size-4" />
            {isReabrindo ? "Reabrindo..." : "Reabrir OS"}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2.5">
        {status !== "cancelado" && (
          <Dialog open={confirmarCancelar} onOpenChange={setConfirmarCancelar}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                <Ban className="size-4" />
                Cancelar OS
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancelar ordem de serviço?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                A OS #OS-{String(numero).padStart(4, "0")} fica marcada como cancelada, mas continua no histórico —
                nada é apagado. Você pode reabri-la depois se precisar.
              </p>
              <DialogFooter>
                <Button type="button" variant="destructive" onClick={handleCancelar} disabled={isCancelando}>
                  {isCancelando ? "Cancelando..." : "Sim, cancelar OS"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <Dialog open={confirmarExcluir} onOpenChange={setConfirmarExcluir}>
          <DialogTrigger asChild>
            <Button type="button" variant="destructive">
              <Trash2 className="size-4" />
              Excluir OS
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir ordem de serviço?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Essa ação não pode ser desfeita. A OS #OS-{String(numero).padStart(4, "0")}, seus itens e o frete
              vinculado (se houver) serão apagados, e ela some do Financeiro.
            </p>
            <DialogFooter>
              <Button type="button" variant="destructive" onClick={handleExcluir} disabled={isDeleting}>
                {isDeleting ? "Excluindo..." : "Sim, excluir definitivamente"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
