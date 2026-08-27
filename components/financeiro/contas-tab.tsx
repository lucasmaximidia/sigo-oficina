"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExportarCsvButton } from "@/components/ui/exportar-csv-button";
import { NovaContaDialog } from "@/components/financeiro/nova-conta-dialog";
import { MarcarPagoButton } from "@/components/financeiro/marcar-pago-button";
import { ExcluirContaButton } from "@/components/financeiro/excluir-lancamento-buttons";
import { FiltroOrdenacaoBar } from "@/components/ui/filtro-ordenacao-bar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { filtrarEOrdenar, type Ordenacao } from "@/lib/filtro-ordenacao";
import { contaStatusMap } from "@/lib/status";
import type { ContaStatus, FinanceiroConta } from "@/types";

export function ContasTab({ contas, hojeStr }: { contas: FinanceiroConta[]; hojeStr: string }) {
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("data_asc");
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFim, setPeriodoFim] = useState("");
  const [soNaoPagas, setSoNaoPagas] = useState(false);

  const contasFiltradas = useMemo(() => {
    const base = soNaoPagas ? contas.filter((c) => c.status !== "pago") : contas;
    return filtrarEOrdenar(base, (c) => c.vencimento, (c) => c.valor, ordenacao, periodoInicio, periodoFim);
  }, [contas, soNaoPagas, ordenacao, periodoInicio, periodoFim]);

  const mensagemVazia =
    contas.length === 0
      ? "Nenhuma conta cadastrada."
      : soNaoPagas
        ? "Nenhuma conta não paga no período selecionado."
        : "Nenhuma conta no período selecionado.";

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        {contas.length > 0 ? (
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
        <div className="flex gap-2">
          <ExportarCsvButton tipo="contas" />
          <NovaContaDialog />
        </div>
      </div>
      {contas.length > 0 && (
        <div className="mb-3 flex items-center gap-2.5">
          <Switch id="so-nao-pagas" checked={soNaoPagas} onCheckedChange={setSoNaoPagas} />
          <Label htmlFor="so-nao-pagas" className="text-sm text-muted-foreground">
            Mostrar só não pagas
          </Label>
        </div>
      )}
      <Card className="overflow-hidden p-0">
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contasFiltradas.map((conta) => {
                const atrasado = conta.status !== "pago" && conta.vencimento < hojeStr;
                const statusInfo = contaStatusMap[(atrasado ? "atrasado" : conta.status) as ContaStatus];
                return (
                  <TableRow key={conta.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{conta.descricao}</p>
                        {conta.parcela_total && (
                          <Badge variant="secondary">
                            {conta.parcela_atual}/{conta.parcela_total}
                          </Badge>
                        )}
                      </div>
                      {conta.fornecedor && <p className="text-xs text-muted-foreground">{conta.fornecedor}</p>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{conta.categoria || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(conta.vencimento)}</TableCell>
                    <TableCell className="font-medium text-foreground">{formatCurrency(conta.valor)}</TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {conta.status !== "pago" && <MarcarPagoButton id={conta.id} />}
                        <ExcluirContaButton id={conta.id} descricao={conta.descricao} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {contasFiltradas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    {mensagemVazia}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col divide-y divide-border md:hidden">
          {contasFiltradas.map((conta) => {
            const atrasado = conta.status !== "pago" && conta.vencimento < hojeStr;
            const statusInfo = contaStatusMap[(atrasado ? "atrasado" : conta.status) as ContaStatus];
            return (
              <div key={conta.id} className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-foreground">{conta.descricao}</p>
                    {conta.parcela_total && (
                      <Badge variant="secondary" className="shrink-0">
                        {conta.parcela_atual}/{conta.parcela_total}
                      </Badge>
                    )}
                  </div>
                  {conta.fornecedor && <p className="text-xs text-muted-foreground">{conta.fornecedor}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {conta.categoria || "—"} · Vence {formatDate(conta.vencimento)}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    <span className="text-sm font-semibold text-foreground">{formatCurrency(conta.valor)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {conta.status !== "pago" && <MarcarPagoButton id={conta.id} />}
                  <ExcluirContaButton id={conta.id} descricao={conta.descricao} />
                </div>
              </div>
            );
          })}
          {contasFiltradas.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {mensagemVazia}
            </p>
          )}
        </div>
      </Card>
    </>
  );
}
