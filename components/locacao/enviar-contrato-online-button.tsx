"use client";

import { Send, Copy } from "lucide-react";
import { toast } from "sonner";
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
  function link() {
    return `${window.location.origin}/locacao/contrato/${aluguelId}`;
  }

  function enviarWhatsapp() {
    const telefone = clienteTelefone?.replace(/\D/g, "");
    const mensagem = encodeURIComponent(
      `Olá ${clienteNome}!\nAqui está o contrato da sua locação na VoltCity.\nDá uma lida e se concordar, clique em "Aceitar contrato", preencha com seu nome e telefone para confirmar.\n\n${link()}`
    );
    const url = telefone ? `https://wa.me/55${telefone}?text=${mensagem}` : `https://wa.me/?text=${mensagem}`;
    window.open(url, "_blank");
  }

  // Abrir o WhatsApp direto (window.open) às vezes não funciona — bloqueio de
  // pop-up, app do WhatsApp ausente, navegador desatualizado — sem nenhum
  // aviso de erro visível. Botão próprio pra só copiar o link dá uma saída
  // manual: a oficina cola onde quiser (WhatsApp, SMS, outro app) em vez de
  // ficar dependente de um só caminho que pode falhar silenciosamente.
  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(link());
      toast.success("Link copiado");
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  }

  return (
    <>
      <Button type="button" variant="outline" size="icon" onClick={enviarWhatsapp} title="Enviar link do contrato por WhatsApp">
        <Send className="size-4" />
      </Button>
      <Button type="button" variant="outline" size="icon" onClick={copiarLink} title="Copiar link do contrato">
        <Copy className="size-4" />
      </Button>
    </>
  );
}
