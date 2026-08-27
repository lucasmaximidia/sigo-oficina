"use client";

import { useMemo, useState } from "react";
import { Wrench, ShoppingCart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExcluirEntradaButton } from "@/components/financeiro/excluir-lancamento-buttons";
import { VendaDetalhesDialog } from "@/components/financeiro/venda-detalhes-dialog";
import { OsDetalhesDialog } from "@/components/financeiro/os-detalhes-dialog";
import { FiltroOrdenacaoBar } from "@/components/ui/filtro-ordenacao-bar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { filtrarEOrdenar, type Ordenacao } from "@/lib/filtro-ordenacao";
import type { Entrada } from "@/types";

export function EntradasTab({ entradas }: { entradas: Entrada[] }) {
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("data_desc");
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFim, setPeriodoFim] = useState("");

  const entradasFiltradas = useMemo(
    () => filtrarEOrdenar(entradas, (e) => e.data, (e) => e.valor, ordenacao, periodoInicio, periodoFim),
    [entradas, ordenacao, periodoInicio, periodoFim]
  );

  return (
    <>
      {entradas.length > 0 && (
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
                <TableHead>Origem</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Forma de Pagamento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="w-10">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entradasFiltradas.map((entrada) => (
                <TableRow key={`${entrada.tipo}-${entrada.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {entrada.tipo === "os" ? (
                        <Wrench className="size-3.5 text-muted-foreground" />
                      ) : (
                        <ShoppingCart className="size-3.5 text-muted-foreground" />
                      )}
                      {entrada.tipo === "os" ? (
                        <OsDetalhesDialog osId={entrada.id} label={entrada.origemLabel} />
                      ) : (
                        <VendaDetalhesDialog vendaId={entrada.id} label={entrada.origemLabel} />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{entrada.cliente}</TableCell>
                  <TableCell className="text-muted-foreground">{entrada.data ? formatDate(entrada.data) : "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{entrada.formaPagamento}</TableCell>
                  <TableCell className="font-medium text-success">{formatCurrency(entrada.valor)}</TableCell>
                  <TableCell>
                    <ExcluirEntradaButton id={entrada.id} tipo={entrada.tipo} origemLabel={entrada.origemLabel} />
                  </TableCell>
                </TableRow>
              ))}
              {entradasFiltradas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    {entradas.length === 0
                      ? "Nenhuma entrada registrada ainda. Elas aparecem aqui quando uma OS é finalizada com pagamento ou uma venda é feita no PDV."
                      : "Nenhuma entrada no período selecionado."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col divide-y divide-border md:hidden">
          {entradasFiltradas.map((entrada) => (
            <div key={`${entrada.tipo}-${entrada.id}`} className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {entrada.tipo === "os" ? (
                    <Wrench className="size-3.5 shrink-0 text-muted-foreground" />
                  ) : (
                    <ShoppingCart className="size-3.5 shrink-0 text-muted-foreground" />
                  )}
                  {entrada.tipo === "os" ? (
                    <OsDetalhesDialog osId={entrada.id} label={entrada.origemLabel} />
                  ) : (
                    <VendaDetalhesDialog vendaId={entrada.id} label={entrada.origemLabel} />
                  )}
                </div>
                <p className="mt-1 truncate text-sm text-foreground">{entrada.cliente}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {entrada.data ? formatDate(entrada.data) : "—"} · {entrada.formaPagamento}
                </p>
                <p className="mt-1 text-sm font-semibold text-success">{formatCurrency(entrada.valor)}</p>
              </div>
              <ExcluirEntradaButton id={entrada.id} tipo={entrada.tipo} origemLabel={entrada.origemLabel} />
            </div>
          ))}
          {entradasFiltradas.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {entradas.length === 0
                ? "Nenhuma entrada registrada ainda. Elas aparecem aqui quando uma OS é finalizada com pagamento ou uma venda é feita no PDV."
                : "Nenhuma entrada no período selecionado."}
            </p>
          )}
        </div>
      </Card>
    </>
  );
}
