"use client";

import { ConfirmDeleteButton } from "@/components/financeiro/confirm-delete-button";
import { deleteContaPagar, deleteDespesa, deleteVendaPdv, reabrirOrdemServico } from "@/lib/actions";

export function ExcluirContaButton({ id, descricao }: { id: string; descricao: string }) {
  return (
    <ConfirmDeleteButton
      title="Excluir conta?"
      description={`A conta "${descricao}" sai do Financeiro, mas fica na Lixeira (Configurações) por segurança — dá pra restaurar depois.`}
      onConfirm={() => deleteContaPagar(id)}
      successMessage="Conta excluída"
    />
  );
}

export function ExcluirDespesaButton({ id, descricao }: { id: string; descricao: string }) {
  return (
    <ConfirmDeleteButton
      title="Excluir despesa?"
      description={`A despesa "${descricao}" sai do Financeiro, mas fica na Lixeira (Configurações) por segurança — dá pra restaurar depois.`}
      onConfirm={() => deleteDespesa(id)}
      successMessage="Despesa excluída"
    />
  );
}

export function ExcluirEntradaButton({
  id,
  tipo,
  origemLabel,
}: {
  id: string;
  tipo: "os" | "pdv";
  origemLabel: string;
}) {
  if (tipo === "pdv") {
    return (
      <ConfirmDeleteButton
        title="Excluir venda?"
        description={`A venda "${origemLabel}" sai do Financeiro e do PDV, mas fica na Lixeira (Configurações) por segurança — dá pra restaurar depois.`}
        onConfirm={() => deleteVendaPdv(id)}
        successMessage="Venda excluída"
      />
    );
  }
  return (
    <ConfirmDeleteButton
      title="Remover este pagamento?"
      description={`O pagamento registrado na ${origemLabel} será removido e ela volta para "Aguardando pagamento". A OS em si, seus itens e o cliente não são afetados — você pode registrar o pagamento correto depois.`}
      onConfirm={() => reabrirOrdemServico(id)}
      successMessage="Pagamento removido — a OS foi reaberta"
    />
  );
}
