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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { formatCurrency } from "@/lib/utils";
import {
  setOrdemServicoPagamento,
  updateOrdemServicoStatus,
  deleteOrdemServico,
  reabrirOrdemServico,
} from "@/lib/actions";
import type { FormaPagamento, OsStatus, TipoCartao } from "@/types";

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

export function OsAcoes({
  osId,
  status,
  numero,
  clienteNome,
  clienteTelefone,
  total,
}: {
  osId: string;
  status: OsStatus;
  numero: number;
  clienteNome: string;
  clienteTelefone: string | null;
  total: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmarExcluir, setConfirmarExcluir] = useState(false);
  const [confirmarCancelar, setConfirmarCancelar] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("pix");
  const [dataPagamento, setDataPagamento] = useState(hoje());
  const [tipoCartao, setTipoCartao] = useState<TipoCartao>("debito");
  const [valorPagoBruto, setValorPagoBruto] = useState(total);
  const [valorRecebidoLiquido, setValorRecebidoLiquido] = useState(total);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [isCancelando, startCancelar] = useTransition();
  const [isReabrindo, startReabrir] = useTransition();

  function handlePrint() {
    window.print();
  }

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
        await setOrdemServicoPagamento(osId, {
          formaPagamento,
          dataPagamento,
          tipoCartao: formaPagamento === "cartao" ? tipoCartao : null,
          valorPagoBruto: formaPagamento === "cartao" ? valorPagoBruto : null,
          valorRecebidoLiquido: formaPagamento === "cartao" ? valorRecebidoLiquido : null,
        });
        await updateOrdemServicoStatus(osId, "finalizado");
        toast.success("Ordem finalizada! A garantia começa a contar a partir da retirada do equipamento.");
        setOpen(false);
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
    <div className="flex flex-col gap-2.5">
      <Button type="button" variant="outline" onClick={handlePrint}>
        <Printer className="size-4" />
        Imprimir OS
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

      {status === "finalizado" && (
        <Button asChild variant="outline">
          <a href={`/api/garantias/${osId}/certificado`} target="_blank" rel="noopener noreferrer">
            <ShieldCheck className="size-4" />
            Baixar Certificado de Garantia
          </a>
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" disabled={status === "finalizado" || status === "cancelado"}>
            <CheckCircle2 className="size-4" />
            {status === "finalizado" ? "Ordem finalizada" : "Finalizar Ordem"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar ordem de serviço</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <Label className="mb-1.5 block">Forma de pagamento</Label>
              <Select value={formaPagamento} onValueChange={(v) => setFormaPagamento(v as FormaPagamento)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="data_pagamento" className="mb-1.5 block">
                Data do pagamento
              </Label>
              <Input
                id="data_pagamento"
                type="date"
                value={dataPagamento}
                max={hoje()}
                onChange={(e) => setDataPagamento(e.target.value)}
              />
            </div>

            {formaPagamento === "cartao" && (
              <div className="flex flex-col gap-4 rounded-xl border border-border bg-secondary/50 p-3.5">
                <div>
                  <Label className="mb-1.5 block">Tipo de cartão</Label>
                  <Select value={tipoCartao} onValueChange={(v) => setTipoCartao(v as TipoCartao)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debito">Débito</SelectItem>
                      <SelectItem value="credito">Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-1.5 block">Valor passado (R$)</Label>
                    <NumericInput defaultValue={valorPagoBruto} onValueChange={setValorPagoBruto} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Valor que entrou (R$)</Label>
                    <NumericInput defaultValue={valorRecebidoLiquido} onValueChange={setValorRecebidoLiquido} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  A diferença entre os dois valores é a taxa da maquininha — o valor que entrou é o que efetivamente
                  cai no caixa.
                </p>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Total a receber: <span className="font-semibold text-foreground">{formatCurrency(total)}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Ao confirmar, a OS é finalizada. A garantia passa a contar a partir da data de retirada do equipamento
              (informe-a depois, quando o cliente buscar).
            </p>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleFinalizar} disabled={isPending}>
              {isPending ? "Finalizando..." : "Confirmar pagamento e finalizar"}
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
              A OS #OS-{String(numero).padStart(4, "0")} fica marcada como cancelada, mas continua no histórico — nada é
              apagado. Você pode reabri-la depois se precisar.
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
  );
}
