// Regras de emissão de NFS-e compartilhadas entre telas (client) e server
// actions: por lei, pagamento em cartão ou PIX deixa rastro eletrônico e
// exige nota fiscal; em dinheiro, quem decide é o cliente.
import type { FormaPagamento, NotaFiscalMotivo, NotaFiscalStatus } from "@/types";

export function nfseObrigatoria(formasPagamento: FormaPagamento[]): boolean {
  return formasPagamento.some((forma) => forma === "cartao" || forma === "pix");
}

export function motivoNotaFiscal(obrigatoria: boolean, clienteDeseja: boolean): NotaFiscalMotivo {
  if (obrigatoria) return "obrigatoria_cartao_pix";
  return clienteDeseja ? "opcional_cliente_sim" : "opcional_cliente_nao";
}

export const notaFiscalStatusMap: Record<
  NotaFiscalStatus,
  { label: string; variant: "secondary" | "info" | "warning" | "success" | "destructive" }
> = {
  pendente: { label: "Pendente", variant: "warning" },
  emitida: { label: "Emitida", variant: "success" },
  erro: { label: "Erro na emissão", variant: "destructive" },
  cancelada: { label: "Cancelada", variant: "secondary" },
  nao_emitir: { label: "Cliente não quis nota", variant: "secondary" },
};

export const notaFiscalMotivoLabel: Record<NotaFiscalMotivo, string> = {
  obrigatoria_cartao_pix: "Obrigatória (cartão/PIX)",
  opcional_cliente_sim: "Opcional — cliente pediu",
  opcional_cliente_nao: "Opcional — cliente não quis",
};
