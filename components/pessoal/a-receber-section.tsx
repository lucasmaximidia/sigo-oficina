import { HandCoins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmarValorInline } from "@/components/pessoal/confirmar-valor-inline";
import { EditarRendaDialog } from "@/components/pessoal/editar-renda-dialog";
import { ExcluirRendaButton } from "@/components/pessoal/pessoal-excluir-buttons";
import { LancarRecebivelTerceiroDialog } from "@/components/pessoal/lancar-recebivel-terceiro-dialog";
import { MarcarRepassadoButton } from "@/components/pessoal/marcar-repassado-button";
import { confirmarRenda } from "@/lib/pessoal-actions";
import { CATEGORIAS_A_RECEBER, DESCRICAO_REPASSE_CARTAO, PESSOAL_CARTAO_CATEGORIA_LABEL } from "@/lib/pessoal-status";
import { formatCurrency } from "@/lib/utils";
import type { PessoalCartaoLancamento, PessoalRenda } from "@/types";

// Dinheiro que terceiros devem: gastos feitos no cartão pessoal por conta da
// oficina/VoltCity/empréstimos (só os já confirmados no cartão) e recebíveis
// avulsos que não passam pelo cartão (ex: taxa de energia que a oficina
// paga pra casa) — cada um marcado como recebido individualmente.
export function ARecemberSection({
  lancamentos,
  renda,
  mes,
}: {
  lancamentos: PessoalCartaoLancamento[];
  renda: PessoalRenda[];
  mes: string;
}) {
  const porCategoria = CATEGORIAS_A_RECEBER.map((categoria) => {
    const itens = lancamentos.filter((l) => l.categoria === categoria && l.valor_real != null);
    const pendente = itens.filter((l) => l.repassado_em == null).reduce((acc, l) => acc + (l.valor_real ?? 0), 0);
    return { categoria, itens, pendente };
  }).filter((c) => c.itens.length > 0);

  const avulsos = renda.filter((r) => r.categoria === "terceiros" && r.descricao !== DESCRICAO_REPASSE_CARTAO);
  const avulsosPendentes = avulsos.filter((r) => r.valor_real == null).reduce((acc, r) => acc + r.valor_previsto, 0);

  const totalPendente = porCategoria.reduce((acc, c) => acc + c.pendente, 0) + avulsosPendentes;
  const temAlgo = porCategoria.length > 0 || avulsos.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <HandCoins className="size-4.5 text-primary" />
            A receber de terceiros
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Gastos confirmados no cartão por conta de Oficina, VoltCity e empréstimos, mais recebíveis avulsos (ex:
            taxas) — marque cada um quando receber de volta.
          </p>
        </div>
        <LancarRecebivelTerceiroDialog mes={mes} />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!temAlgo ? (
          <p className="text-sm text-muted-foreground">Nenhum gasto ou recebível de terceiros neste mês ainda.</p>
        ) : (
          <>
            {porCategoria.map((c) => (
              <div key={c.categoria} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{PESSOAL_CARTAO_CATEGORIA_LABEL[c.categoria]}</span>
                  <span className="font-medium text-foreground">{formatCurrency(c.pendente)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  {c.itens.map((item) => {
                    const repassado = item.repassado_em != null;
                    return (
                      <div key={item.id} className="flex items-center justify-between gap-2 text-xs">
                        <span className={repassado ? "truncate text-muted-foreground line-through" : "truncate text-foreground"}>
                          {item.descricao}
                        </span>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className={repassado ? "text-muted-foreground line-through" : "font-medium text-foreground"}>
                            {formatCurrency(item.valor_real ?? 0)}
                          </span>
                          <MarcarRepassadoButton id={item.id} repassado={repassado} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {avulsos.length > 0 && (
              <div className="flex flex-col gap-1.5 border-t border-border pt-3">
                <span className="text-sm font-medium text-foreground">Outros recebíveis</span>
                <div className="flex flex-col gap-2">
                  {avulsos.map((r) => (
                    <div
                      key={r.id}
                      className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-lg border border-border p-2.5 text-sm"
                    >
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate font-medium text-foreground">{r.descricao}</span>
                        <span className="text-xs text-muted-foreground">Previsto {formatCurrency(r.valor_previsto)}</span>
                      </div>
                      <ConfirmarValorInline
                        valorReal={r.valor_real}
                        valorPrevisto={r.valor_previsto}
                        onConfirm={confirmarRenda.bind(null, r.id)}
                      />
                      <EditarRendaDialog renda={r} />
                      <ExcluirRendaButton id={r.id} descricao={r.descricao} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border pt-2.5">
              <span className="text-sm font-semibold text-foreground">Total a receber</span>
              <span className="text-lg font-bold text-success">{formatCurrency(totalPendente)}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
