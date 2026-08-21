"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Printer, MessageCircle, CheckCircle2 } from "lucide-react";
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
import { formatCurrency } from "@/lib/utils";
import { setOrdemServicoPagamento, updateOrdemServicoStatus } from "@/lib/actions";
import type { FormaPagamento, OsStatus } from "@/types";

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
  const [open, setOpen] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("pix");
  const [isPending, startTransition] = useTransition();

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
        await setOrdemServicoPagamento(osId, formaPagamento);
        await updateOrdemServicoStatus(osId, "finalizado");
        toast.success("Ordem finalizada! A garantia começou a contar.");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao finalizar OS");
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
            <p className="mt-3 text-sm text-muted-foreground">
              Total a receber: <span className="font-semibold text-foreground">{formatCurrency(total)}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ao confirmar, a garantia do serviço começa a contar a partir de hoje.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleFinalizar} disabled={isPending}>
              {isPending ? "Finalizando..." : "Confirmar pagamento e finalizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
