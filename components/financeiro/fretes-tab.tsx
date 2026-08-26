"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MarcarFretePagoButton } from "@/components/financeiro/marcar-frete-pago-button";
import { FiltroOrdenacaoBar } from "@/components/ui/filtro-ordenacao-bar";
import { cn, formatCurrency } from "@/lib/utils";
import { filtrarEOrdenar, type Ordenacao } from "@/lib/filtro-ordenacao";
import { freteStatusMap } from "@/lib/status";
import type { FreteComRelacoes } from "@/types";

export function FretesTab({ fretes }: { fretes: FreteComRelacoes[] }) {
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("data_desc");
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFim, setPeriodoFim] = useState("");

  const fretesFiltrados = useMemo(
    () =>
      filtrarEOrdenar(
        fretes,
        (f) => f.data_pagamento ?? f.created_at.slice(0, 10),
        (f) => f.valor_custo,
        ordenacao,
        periodoInicio,
        periodoFim
      ),
    [fretes, ordenacao, periodoInicio, periodoFim]
  );

  return (
    <>
      {fretes.length > 0 && (
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
                <TableHead>OS</TableHead>
                <TableHead>Prestador</TableHead>
                <TableHead>Cobrado do cliente</TableHead>
                <TableHead>Pago ao prestador</TableHead>
                <TableHead>Margem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fretesFiltrados.map((frete) => {
                const statusInfo = freteStatusMap[frete.status];
                const cobrado = frete.ordens_servico?.valor_frete ?? 0;
                const margem = cobrado - frete.valor_custo;
                return (
                  <TableRow key={frete.id}>
                    <TableCell className="font-semibold text-primary">
                      {frete.ordens_servico && (
                        <Link href={`/ordens-servico/${frete.os_id}`}>
                          #OS-{String(frete.ordens_servico.numero).padStart(4, "0")}
                        </Link>
                      )}
                    </TableCell>
                    <TableCell className="text-foreground">{frete.prestadores_frete?.nome ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{formatCurrency(cobrado)}</TableCell>
                    <TableCell className="font-medium text-foreground">{formatCurrency(frete.valor_custo)}</TableCell>
                    <TableCell className={margem >= 0 ? "text-success" : "text-destructive"}>
                      {formatCurrency(margem)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {frete.status === "pendente" && <MarcarFretePagoButton freteId={frete.id} osId={frete.os_id} />}
                    </TableCell>
                  </TableRow>
                );
              })}
              {fretesFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    {fretes.length === 0
                      ? 'Nenhum frete registrado ainda. Eles aparecem aqui quando você define a origem "Frete" numa OS.'
                      : "Nenhum frete no período selecionado."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col divide-y divide-border md:hidden">
          {fretesFiltrados.map((frete) => {
            const statusInfo = freteStatusMap[frete.status];
            const cobrado = frete.ordens_servico?.valor_frete ?? 0;
            const margem = cobrado - frete.valor_custo;
            return (
              <div key={frete.id} className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  {frete.ordens_servico && (
                    <Link href={`/ordens-servico/${frete.os_id}`} className="font-semibold text-primary">
                      #OS-{String(frete.ordens_servico.numero).padStart(4, "0")}
                    </Link>
                  )}
                  <p className="mt-0.5 text-sm text-foreground">{frete.prestadores_frete?.nome ?? "—"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Cobrado {formatCurrency(cobrado)} · Pago {formatCurrency(frete.valor_custo)}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    <span className={cn("text-sm font-semibold", margem >= 0 ? "text-success" : "text-destructive")}>
                      Margem {formatCurrency(margem)}
                    </span>
                  </div>
                </div>
                {frete.status === "pendente" && <MarcarFretePagoButton freteId={frete.id} osId={frete.os_id} />}
              </div>
            );
          })}
          {fretesFiltrados.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {fretes.length === 0
                ? 'Nenhum frete registrado ainda. Eles aparecem aqui quando você define a origem "Frete" numa OS.'
                : "Nenhum frete no período selecionado."}
            </p>
          )}
        </div>
      </Card>
    </>
  );
}
