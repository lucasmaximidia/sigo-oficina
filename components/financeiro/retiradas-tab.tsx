"use client";

import { useMemo, useState } from "react";
import { HandCoins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { ResponsiveList } from "@/components/ui/responsive-list";
import { LancarRetiradaDialog } from "@/components/financeiro/lancar-retirada-dialog";
import { ExcluirRetiradaButton } from "@/components/financeiro/excluir-lancamento-buttons";
import { FiltroOrdenacaoBar } from "@/components/ui/filtro-ordenacao-bar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { filtrarEOrdenar, type Ordenacao } from "@/lib/filtro-ordenacao";
import { retiradaTipoMap } from "@/lib/status";
import type { FinanceiroRetirada, RetiradaTipo } from "@/types";

export function RetiradasTab({ retiradas }: { retiradas: FinanceiroRetirada[] }) {
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("data_desc");
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFim, setPeriodoFim] = useState("");

  const retiradasFiltradas = useMemo(
    () => filtrarEOrdenar(retiradas, (r) => r.data, (r) => r.valor, ordenacao, periodoInicio, periodoFim),
    [retiradas, ordenacao, periodoInicio, periodoFim]
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Retiradas lançadas</p>
        <LancarRetiradaDialog />
      </div>
      {retiradas.length > 0 && (
        <FiltroOrdenacaoBar
          ordenacao={ordenacao}
          onOrdenacaoChange={setOrdenacao}
          periodoInicio={periodoInicio}
          onPeriodoInicioChange={setPeriodoInicio}
          periodoFim={periodoFim}
          onPeriodoFimChange={setPeriodoFim}
        />
      )}
      <Card className="overflow-hidden p-0">
        <ResponsiveList
          items={retiradasFiltradas}
          colSpan={5}
          empty={
            <EmptyState
              icon={<HandCoins className="size-5" />}
              title={retiradas.length === 0 ? "Nenhuma retirada lançada" : "Nenhuma retirada no período selecionado"}
            />
          }
          header={
            <>
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="w-10">Ações</TableHead>
            </>
          }
          renderRow={(retirada) => {
            const tipoInfo = retiradaTipoMap[retirada.tipo as RetiradaTipo];
            return (
              <TableRow key={retirada.id}>
                <TableCell className="font-medium text-foreground">{retirada.descricao}</TableCell>
                <TableCell>
                  <Badge variant={tipoInfo.variant}>{tipoInfo.label}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(retirada.data)}</TableCell>
                <TableCell className="font-medium text-foreground">{formatCurrency(retirada.valor)}</TableCell>
                <TableCell>
                  <ExcluirRetiradaButton id={retirada.id} descricao={retirada.descricao} />
                </TableCell>
              </TableRow>
            );
          }}
          renderCard={(retirada) => {
            const tipoInfo = retiradaTipoMap[retirada.tipo as RetiradaTipo];
            return (
              <div key={retirada.id} className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{retirada.descricao}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant={tipoInfo.variant}>{tipoInfo.label}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(retirada.data)}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-foreground">{formatCurrency(retirada.valor)}</p>
                </div>
                <ExcluirRetiradaButton id={retirada.id} descricao={retirada.descricao} />
              </div>
            );
          }}
        />
      </Card>
    </div>
  );
}
