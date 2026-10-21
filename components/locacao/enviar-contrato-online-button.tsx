"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EnviarContratoOnlineButton({
  aluguelId,
  clienteNome,
  clienteTelefone,
}: {
  aluguelId: string;
  clienteNome: string;
  clienteTelefone: string | null;
}) {
  function enviar() {
    const link = `${window.location.origin}/locacao/contrato/${aluguelId}`;
    const telefone = clienteTelefone?.replace(/\D/g, "");
    const mensagem = encodeURIComponent(
      `Olá ${clienteNome}! Aqui está o contrato da sua locação na VoltCity. Dá uma olhada e clique em "Aceitar contrato" pra confirmar: ${link}`
    );
    const url = telefone ? `https://wa.me/55${telefone}?text=${mensagem}` : `https://wa.me/?text=${mensagem}`;
    window.open(url, "_blank");
  }

  return (
    <Button type="button" variant="outline" size="icon" onClick={enviar} title="Enviar link do contrato online">
      <Send className="size-4" />
    </Button>
  );
}
