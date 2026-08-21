"use client";

import { Download, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

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
  function handleWhatsapp() {
    const telefone = clienteTelefone?.replace(/\D/g, "");
    const mensagem = encodeURIComponent(
      `Olá ${clienteNome}, segue o orçamento #ORC-${String(numero).padStart(4, "0")} no valor de ${formatCurrency(total)}. Qualquer dúvida estamos à disposição!`
    );
    const url = telefone ? `https://wa.me/55${telefone}?text=${mensagem}` : `https://wa.me/?text=${mensagem}`;
    window.open(url, "_blank");
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
    </div>
  );
}
