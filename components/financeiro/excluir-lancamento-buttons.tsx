"use client";

import { ConfirmDeleteButton } from "@/components/financeiro/confirm-delete-button";
import { deleteContaPagar, deleteDespesa, deleteRetirada, deleteVendaPdv, deleteAjusteCaixa, deleteOsPagamento } from "@/lib/actions";
import { formatCurrency } from "@/lib/utils";

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

export function ExcluirDespesaButton({
  id,
  descricao,
  osItemId,
}: {
  id: string;
  descricao: string;
  osItemId?: string | null;
}) {
  return (
    <ConfirmDeleteButton
      title="Excluir despesa?"
      description={
        osItemId
          ? `A despesa "${descricao}" sai do Financeiro (fica na Lixeira, dá pra restaurar) e o item correspondente também é removido da OS — essa despesa foi gerada automaticamente por uma compra emergencial.`
          : `A despesa "${descricao}" sai do Financeiro, mas fica na Lixeira (Configurações) por segurança — dá pra restaurar depois.`
      }
      onConfirm={() => deleteDespesa(id)}
      successMessage="Despesa excluída"
    />
  );
}

export function ExcluirRetiradaButton({ id, descricao }: { id: string; descricao: string }) {
  return (
    <ConfirmDeleteButton
      title="Excluir retirada?"
      description={`A retirada "${descricao}" sai do Financeiro, mas fica na Lixeira (Configurações) por segurança — dá pra restaurar depois.`}
      onConfirm={() => deleteRetirada(id)}
      successMessage="Retirada excluída"
    />
  );
}

export function ExcluirAjusteCaixaButton({ id, descricao }: { id: string; descricao: string }) {
  return (
    <ConfirmDeleteButton
      title="Excluir ajuste de caixa?"
      description={`O ajuste "${descricao}" sai do Financeiro, mas fica na Lixeira (Configurações) por segurança — dá pra restaurar depois.`}
      onConfirm={() => deleteAjusteCaixa(id)}
      successMessage="Ajuste excluído"
    />
  );
}

export function ExcluirEntradaButton({
  id,
  pagamentoId,
  tipo,
  origemLabel,
  valor,
}: {
  id: string;
  pagamentoId?: string;
  tipo: "os" | "pdv";
  origemLabel: string;
  valor: number;
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
  if (!pagamentoId) return null;
  return (
    <ConfirmDeleteButton
      title="Remover este pagamento?"
      description={`O pagamento de ${formatCurrency(valor)} registrado na ${origemLabel} será removido. Se isso derrubar o total pago abaixo do valor da OS, ela volta a aparecer como "Aguardando pagamento" — você pode registrar o valor certo depois. Os demais pagamentos dessa OS não são afetados.`}
      onConfirm={() => deleteOsPagamento(pagamentoId, id)}
      successMessage="Pagamento removido"
    />
  );
}
