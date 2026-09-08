"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, MessageCircle, Trash2 } from "lucide-react";
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
import { deleteOrcamento } from "@/lib/actions";

export function OrcamentoAcoes({
  orcamentoId,
  numero,
  clienteNome,
  clienteTelefone,
  total,
}: {
  orcamentoId: string;
  numero: number;
  clienteNome: string;
  clienteTelefone: string | null;
  total: number;
}) {
  const router = useRouter();
  const [confirmarExcluir, setConfirmarExcluir] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  function handleWhatsapp() {
    const telefone = clienteTelefone?.replace(/\D/g, "");
    const mensagem = encodeURIComponent(
      `Olá ${clienteNome}, segue o orçamento #ORC-${String(numero).padStart(4, "0")} no valor de ${formatCurrency(total)}. Qualquer dúvida estamos à disposição!`
    );
    const url = telefone ? `https://wa.me/55${telefone}?text=${mensagem}` : `https://wa.me/?text=${mensagem}`;
    window.open(url, "_blank");
  }

  function handleExcluir() {
    startDelete(async () => {
      try {
        await deleteOrcamento(orcamentoId);
        toast.success("Orçamento excluído");
        router.push("/orcamentos");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao excluir orçamento");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2.5">
      <Button asChild>
        <a href={`/api/orcamentos/${orcamentoId}/pdf`} target="_blank" rel="noopener noreferrer">
          <Download className="size-4" />
          Baixar PDF
        </a>
      </Button>
      <Button type="button" variant="secondary" onClick={handleWhatsapp}>
        <MessageCircle className="size-4" />
        Compartilhar no WhatsApp
      </Button>

      <Dialog open={confirmarExcluir} onOpenChange={setConfirmarExcluir}>
        <DialogTrigger asChild>
          <Button type="button" variant="destructive">
            <Trash2 className="size-4" />
            Excluir Orçamento
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir orçamento?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Essa ação não pode ser desfeita. O orçamento #ORC-{String(numero).padStart(4, "0")} e seus itens serão
            apagados.
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
