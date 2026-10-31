"use client";

import { useMemo, useState } from "react";
import { Wallet2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { ResponsiveList } from "@/components/ui/responsive-list";
import { ExportarCsvButton } from "@/components/ui/exportar-csv-button";
import { ExcluirDespesaButton } from "@/components/financeiro/excluir-lancamento-buttons";
import { FiltroOrdenacaoBar } from "@/components/ui/filtro-ordenacao-bar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { filtrarEOrdenar, type Ordenacao } from "@/lib/filtro-ordenacao";
import type { FinanceiroDespesa } from "@/types";

function BadgeCartao({ despesa }: { despesa: FinanceiroDespesa }) {
  if (!despesa.cartao) return null;
  return (
    <Badge variant={despesa.pago_em ? "secondary" : "warning"}>
      {despesa.pago_em ? `Fatura paga em ${formatDate(despesa.pago_em)}` : "No cartão — aguardando fatura"}
    </Badge>
  );
}

export function DespesasTab({ despesas }: { despesas: FinanceiroDespesa[] }) {
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("data_desc");
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFim, setPeriodoFim] = useState("");

  const despesasFiltradas = useMemo(
    () => filtrarEOrdenar(despesas, (d) => d.data, (d) => d.valor, ordenacao, periodoInicio, periodoFim),
    [despesas, ordenacao, periodoInicio, periodoFim]
  );

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        {despesas.length > 0 ? (
          <FiltroOrdenacaoBar
            ordenacao={ordenacao}
            onOrdenacaoChange={setOrdenacao}
            periodoInicio={periodoInicio}
            onPeriodoInicioChange={setPeriodoInicio}
            periodoFim={periodoFim}
            onPeriodoFimChange={setPeriodoFim}
          />
        ) : (
          <div />
        )}
        <ExportarCsvButton tipo="despesas" />
      </div>
      <Card className="overflow-hidden p-0">
        <ResponsiveList
          items={despesasFiltradas}
          colSpan={5}
          empty={
            <EmptyState
              icon={<Wallet2 className="size-5" />}
              title={despesas.length === 0 ? "Nenhuma despesa lançada" : "Nenhuma despesa no período selecionado"}
            />
          }
          header={
            <>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="w-10">Ações</TableHead>
            </>
          }
          renderRow={(despesa) => (
            <TableRow key={despesa.id}>
              <TableCell className="font-medium text-foreground">
                <div className="flex flex-wrap items-center gap-2">
                  {despesa.descricao}
                  <BadgeCartao despesa={despesa} />
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{despesa.categoria || "—"}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(despesa.data)}</TableCell>
              <TableCell className="font-medium text-foreground">{formatCurrency(despesa.valor)}</TableCell>
              <TableCell>
                <ExcluirDespesaButton id={despesa.id} descricao={despesa.descricao} osItemId={despesa.os_item_id} />
              </TableCell>
            </TableRow>
          )}
          renderCard={(despesa) => (
            <div key={despesa.id} className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{despesa.descricao}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {despesa.categoria || "—"} · {formatDate(despesa.data)}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">{formatCurrency(despesa.valor)}</p>
                <div className="mt-1.5">
                  <BadgeCartao despesa={despesa} />
                </div>
              </div>
              <ExcluirDespesaButton id={despesa.id} descricao={despesa.descricao} osItemId={despesa.os_item_id} />
            </div>
          )}
        />
      </Card>
    </>
  );
}
