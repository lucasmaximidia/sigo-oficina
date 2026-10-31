import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";
import { CartaoDialog } from "@/components/pessoal/cartao-dialog";
import { LancarCompraCartaoDialog } from "@/components/pessoal/lancar-compra-cartao-dialog";
import { FecharFaturaButton } from "@/components/pessoal/fechar-fatura-button";
import { ConfirmarValorInline } from "@/components/pessoal/confirmar-valor-inline";
import { ExcluirLancamentoCartaoButton } from "@/components/pessoal/pessoal-excluir-buttons";
import { confirmarLancamentoCartao } from "@/lib/pessoal-actions";
import { PESSOAL_CARTAO_CATEGORIA_LABEL } from "@/lib/pessoal-status";
import { formatCurrency } from "@/lib/utils";
import type { PessoalCartao, PessoalCartaoLancamento } from "@/types";

export function CartoesSection({
  cartoes,
  lancamentos,
  mes,
}: {
  cartoes: PessoalCartao[];
  lancamentos: PessoalCartaoLancamento[];
  mes: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LancarCompraCartaoDialog cartoes={cartoes.filter((c) => c.ativo)} mes={mes} />
        </div>
        <CartaoDialog />
      </div>

      {cartoes.length === 0 && <p className="text-sm text-muted-foreground">Nenhum cartão cadastrado ainda.</p>}

      {cartoes.map((cartao) => {
        const lancamentosDoCartao = lancamentos.filter((l) => l.cartao_id === cartao.id);
        const totalPrevisto = lancamentosDoCartao.reduce((acc, l) => acc + l.valor_previsto, 0);
        const totalReal = lancamentosDoCartao.reduce((acc, l) => acc + (l.valor_real ?? 0), 0);
        const temPendente = lancamentosDoCartao.some((l) => l.valor_real == null);

        return (
          <Card key={cartao.id}>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CreditCard className="size-4.5 text-primary" />
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {cartao.nome}
                    {!cartao.ativo && <Badge variant="secondary">Inativo</Badge>}
                    <CartaoDialog cartao={cartao} />
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Previsto {formatCurrency(totalPrevisto)} · Real {formatCurrency(totalReal)}
                  </p>
                </div>
              </div>
              {temPendente && <FecharFaturaButton cartaoId={cartao.id} mes={mes} />}
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
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
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {PESSOAL_CARTAO_CATEGORIA_LABEL[l.categoria]} · Previsto {formatCurrency(l.valor_previsto)}
                      </span>
                    </div>
                    <ConfirmarValorInline
                      valorReal={l.valor_real}
                      valorPrevisto={l.valor_previsto}
                      onConfirm={(valor) => confirmarLancamentoCartao(l.id, valor)}
                    />
                    <ExcluirLancamentoCartaoButton
                      id={l.id}
                      compraId={l.compra_id}
                      parcelaTotal={l.parcela_total}
                      descricao={l.descricao}
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
