"use client";

import { ConfirmDeleteButton } from "@/components/financeiro/confirm-delete-button";
import { deleteRenda, deleteItemMes, deleteLancamentoCartao, deleteCompraCartao } from "@/lib/pessoal-actions";

export function ExcluirRendaButton({ id, descricao }: { id: string; descricao: string }) {
  return (
    <ConfirmDeleteButton
      title="Excluir renda?"
      description={`A renda "${descricao}" será removida deste mês.`}
      onConfirm={() => deleteRenda(id)}
      successMessage="Renda excluída"
    />
  );
}

export function ExcluirItemMesButton({ id, descricao }: { id: string; descricao: string }) {
  return (
    <ConfirmDeleteButton
      title="Excluir item?"
      description={`"${descricao}" será removido deste mês.`}
      onConfirm={() => deleteItemMes(id)}
      successMessage="Item excluído"
    />
  );
}

export function ExcluirLancamentoCartaoButton({
  id,
  compraId,
  parcelaTotal,
  descricao,
}: {
  id: string;
  compraId: string;
  parcelaTotal: number;
  descricao: string;
}) {
  if (parcelaTotal <= 1) {
    return (
      <ConfirmDeleteButton
        title="Excluir lançamento?"
        description={`"${descricao}" será removido deste cartão/mês.`}
        onConfirm={() => deleteLancamentoCartao(id)}
        successMessage="Lançamento excluído"
      />
    );
  }
  return (
    <ConfirmDeleteButton
      title="Excluir compra parcelada?"
      description={`"${descricao}" — isso remove TODAS as ${parcelaTotal} parcelas dessa compra, passadas e futuras.`}
      onConfirm={() => deleteCompraCartao(compraId)}
      successMessage="Compra excluída"
    />
  );
}
