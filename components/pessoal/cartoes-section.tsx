import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { PrevistoReal } from "@/components/pessoal/previsto-real";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";
import { CartaoDialog } from "@/components/pessoal/cartao-dialog";
import { LancarCompraCartaoDialog } from "@/components/pessoal/lancar-compra-cartao-dialog";
import { FecharFaturaButton } from "@/components/pessoal/fechar-fatura-button";
import { MarcarFaturaPagaButton } from "@/components/pessoal/marcar-fatura-paga-button";
import { ConfirmarValorInline } from "@/components/pessoal/confirmar-valor-inline";
import { EditarLancamentoCartaoDialog } from "@/components/pessoal/editar-lancamento-cartao-dialog";
import { ExcluirLancamentoCartaoButton } from "@/components/pessoal/pessoal-excluir-buttons";
import { confirmarLancamentoCartao } from "@/lib/pessoal-actions";
import { PESSOAL_CARTAO_CATEGORIA_LABEL } from "@/lib/pessoal-status";
import { formatCurrency } from "@/lib/utils";
import type { PessoalCartao, PessoalCartaoLancamento, PessoalCartaoFatura } from "@/types";

export function CartoesSection({
  cartoes,
  lancamentos,
  faturas,
  mes,
}: {
  cartoes: PessoalCartao[];
  lancamentos: PessoalCartaoLancamento[];
  faturas: PessoalCartaoFatura[];
  mes: string;
}) {
  const cartoesAtivos = cartoes.filter((c) => c.ativo);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <CartaoDialog />
      </div>

      {cartoes.length === 0 && <p className="text-sm text-muted-foreground">Nenhum cartão cadastrado ainda.</p>}

      {cartoes.map((cartao) => {
        const lancamentosDoCartao = lancamentos.filter((l) => l.cartao_id === cartao.id);
        const totalPrevisto = lancamentosDoCartao.reduce((acc, l) => acc + l.valor_previsto, 0);
        const totalReal = lancamentosDoCartao.reduce((acc, l) => acc + (l.valor_real ?? 0), 0);
        const temPendente = lancamentosDoCartao.some((l) => l.valor_real == null);
        const fatura = faturas.find((f) => f.cartao_id === cartao.id);

        return (
          <CollapsibleCard
            key={cartao.id}
            id={`cartao-${cartao.id}`}
            icon={<CreditCard className="size-4.5 text-primary" />}
            title={
              <>
                {cartao.nome}
                {!cartao.ativo && <Badge variant="secondary">Inativo</Badge>}
              </>
            }
            meta={<PrevistoReal previsto={totalPrevisto} real={totalReal} />}
            defaultOpen={lancamentosDoCartao.length > 0}
            actions={
              <>
                <CartaoDialog cartao={cartao} />
                {cartao.ativo && <LancarCompraCartaoDialog cartoes={cartoesAtivos} mes={mes} cartaoIdPadrao={cartao.id} />}
                {temPendente && <FecharFaturaButton cartaoId={cartao.id} mes={mes} />}
                <MarcarFaturaPagaButton cartaoId={cartao.id} mes={mes} pagoEm={fatura?.pago_em ?? null} />
              </>
            }
          >
            {lancamentosDoCartao.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum lançamento neste mês.</p>
            ) : (
              lancamentosDoCartao.map((l) => (
                <div
                  key={l.id}
                  className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-lg border border-border p-3 text-sm"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate font-medium text-foreground">
                      {l.descricao}
                      {l.parcela_total > 1 && (
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          {l.parcela_atual}/{l.parcela_total}
                        </span>
                      )}
                      {l.eh_fixa && <Badge variant="outline" className="ml-1.5 align-middle text-[10px]">Fixa</Badge>}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {PESSOAL_CARTAO_CATEGORIA_LABEL[l.categoria]} · Previsto {formatCurrency(l.valor_previsto)}
                    </span>
                  </div>
                  <ConfirmarValorInline
                    valorReal={l.valor_real}
                    valorPrevisto={l.valor_previsto}
                    onConfirm={confirmarLancamentoCartao.bind(null, l.id)}
                  />
                  <EditarLancamentoCartaoDialog lancamento={l} />
                  <ExcluirLancamentoCartaoButton
                    id={l.id}
                    compraId={l.compra_id}
                    parcelaTotal={l.parcela_total}
                    descricao={l.descricao}
                  />
                </div>
              ))
            )}
          </CollapsibleCard>
        );
      })}
    </div>
  );
}
