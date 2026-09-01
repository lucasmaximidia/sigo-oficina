"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LancarAjusteCaixaDialog } from "@/components/financeiro/lancar-ajuste-caixa-dialog";
import { ExcluirAjusteCaixaButton } from "@/components/financeiro/excluir-lancamento-buttons";
import { FiltroOrdenacaoBar } from "@/components/ui/filtro-ordenacao-bar";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { filtrarEOrdenar, type Ordenacao } from "@/lib/filtro-ordenacao";
import type { FinanceiroAjusteCaixa } from "@/types";

export function AjustesCaixaTab({ ajustes }: { ajustes: FinanceiroAjusteCaixa[] }) {
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("data_desc");
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFim, setPeriodoFim] = useState("");

  const ajustesFiltrados = useMemo(
    () => filtrarEOrdenar(ajustes, (a) => a.data, (a) => a.valor, ordenacao, periodoInicio, periodoFim),
    [ajustes, ordenacao, periodoInicio, periodoFim]
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Ajustes lançados</p>
        <LancarAjusteCaixaDialog />
      </div>
      {ajustes.length > 0 && (
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
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="w-10">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ajustesFiltrados.map((ajuste) => (
                <TableRow key={ajuste.id}>
                  <TableCell className="font-medium text-foreground">{ajuste.descricao}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(ajuste.data)}</TableCell>
                  <TableCell className={cn("font-medium", ajuste.valor >= 0 ? "text-success" : "text-destructive")}>
                    {ajuste.valor >= 0 ? "+" : ""}
                    {formatCurrency(ajuste.valor)}
                  </TableCell>
                  <TableCell>
                    <ExcluirAjusteCaixaButton id={ajuste.id} descricao={ajuste.descricao} />
                  </TableCell>
                </TableRow>
              ))}
              {ajustesFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    {ajustes.length === 0 ? "Nenhum ajuste lançado." : "Nenhum ajuste no período selecionado."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col divide-y divide-border md:hidden">
          {ajustesFiltrados.map((ajuste) => (
            <div key={ajuste.id} className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{ajuste.descricao}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(ajuste.data)}</p>
                <p className={cn("mt-1 text-sm font-semibold", ajuste.valor >= 0 ? "text-success" : "text-destructive")}>
                  {ajuste.valor >= 0 ? "+" : ""}
                  {formatCurrency(ajuste.valor)}
                </p>
              </div>
              <ExcluirAjusteCaixaButton id={ajuste.id} descricao={ajuste.descricao} />
            </div>
          ))}
          {ajustesFiltrados.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {ajustes.length === 0 ? "Nenhum ajuste lançado." : "Nenhum ajuste no período selecionado."}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
