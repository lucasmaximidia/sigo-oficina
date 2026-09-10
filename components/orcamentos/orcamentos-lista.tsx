"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { ResponsiveList } from "@/components/ui/responsive-list";
import { FiltroOrdenacaoBar } from "@/components/ui/filtro-ordenacao-bar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { filtrarEOrdenar, type Ordenacao } from "@/lib/filtro-ordenacao";
import { orcamentoStatusMap } from "@/lib/status";
import type { OrcamentoStatus } from "@/types";

export interface OrcamentoListItem {
  id: string;
  numero: number;
  clienteNome: string;
  total: number;
  dataValidade: string;
  createdAt: string;
  statusExibido: OrcamentoStatus;
}

export function OrcamentosLista({ orcamentos }: { orcamentos: OrcamentoListItem[] }) {
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("data_desc");
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFim, setPeriodoFim] = useState("");

  const orcamentosFiltrados = useMemo(
    () =>
      filtrarEOrdenar(
        orcamentos,
        (o) => o.createdAt.slice(0, 10),
        (o) => o.total,
        ordenacao,
        periodoInicio,
        periodoFim
      ),
    [orcamentos, ordenacao, periodoInicio, periodoFim]
  );

  return (
    <>
      {orcamentos.length > 0 && (
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
          items={orcamentosFiltrados}
          colSpan={6}
          empty={
            <EmptyState
              icon={<FileText className="size-5" />}
              title={orcamentos.length === 0 ? "Nenhum orçamento criado ainda" : "Nenhum orçamento encontrado"}
            />
          }
          header={
            <>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Válido até</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10"></TableHead>
            </>
          }
          renderRow={(orc) => {
            const statusInfo = orcamentoStatusMap[orc.statusExibido];
            return (
              <TableRow key={orc.id}>
                <TableCell className="font-semibold text-primary">
                  <Link href={`/orcamentos/${orc.id}`}>#ORC-{String(orc.numero).padStart(4, "0")}</Link>
                </TableCell>
                <TableCell className="font-medium text-foreground">{orc.clienteNome}</TableCell>
                <TableCell className="font-medium text-foreground">{formatCurrency(orc.total)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(orc.dataValidade)}</TableCell>
                <TableCell>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </TableCell>
                <TableCell>
                  <Link href={`/orcamentos/${orc.id}`}>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Link>
                </TableCell>
              </TableRow>
            );
          }}
          renderCard={(orc) => {
            const statusInfo = orcamentoStatusMap[orc.statusExibido];
            return (
              <Link
                key={orc.id}
                href={`/orcamentos/${orc.id}`}
                className="flex items-center justify-between gap-3 p-4 active:bg-secondary/50"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-primary">#ORC-{String(orc.numero).padStart(4, "0")}</p>
                  <p className="truncate text-sm font-medium text-foreground">{orc.clienteNome}</p>
                  <p className="text-xs text-muted-foreground">Válido até {formatDate(orc.dataValidade)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  <p className="text-sm font-semibold text-foreground">{formatCurrency(orc.total)}</p>
                </div>
              </Link>
            );
          }}
        />
      </Card>
    </>
  );
}
