import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { orcamentoStatusMap } from "@/lib/status";
import type { OrcamentoStatus } from "@/types";

export const dynamic = "force-dynamic";

interface OrcamentoListRow {
  id: string;
  numero: number;
  status: OrcamentoStatus;
  data_validade: string;
  desconto: number;
  created_at: string;
  clientes: { nome: string } | null;
  orcamento_itens: { quantidade: number; valor_unitario: number }[];
}

export default async function OrcamentosPage() {
  const { data: orcamentos } = await supabase
    .from("orcamentos")
    .select<string, OrcamentoListRow>(
      "id, numero, status, data_validade, desconto, created_at, clientes(nome), orcamento_itens(quantidade, valor_unitario)"
    )
    .order("created_at", { ascending: false });

  const hojeStr = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <PageHeader
        title="Orçamentos"
        description="Monte e envie orçamentos profissionais para seus clientes."
        actions={
          <Button asChild>
            <Link href="/orcamentos/novo">
              <Plus className="size-4" />
              Novo Orçamento
            </Link>
          </Button>
        }
      />

      <Card className="overflow-hidden p-0">
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Válido até</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(orcamentos ?? []).map((orc) => {
                const totalItens = orc.orcamento_itens.reduce((acc, i) => acc + i.quantidade * i.valor_unitario, 0);
                const total = Math.max(0, totalItens - orc.desconto);
                const vencido = orc.data_validade < hojeStr && orc.status !== "aprovado" && orc.status !== "recusado";
                const statusInfo = orcamentoStatusMap[vencido ? "expirado" : orc.status];
                return (
                  <TableRow key={orc.id}>
                    <TableCell className="font-semibold text-primary">
                      <Link href={`/orcamentos/${orc.id}`}>#ORC-{String(orc.numero).padStart(4, "0")}</Link>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{orc.clientes?.nome ?? "—"}</TableCell>
                    <TableCell className="font-medium text-foreground">{formatCurrency(total)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(orc.data_validade)}</TableCell>
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
              })}
              {(orcamentos ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Nenhum orçamento criado ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col divide-y divide-border md:hidden">
          {(orcamentos ?? []).map((orc) => {
            const totalItens = orc.orcamento_itens.reduce((acc, i) => acc + i.quantidade * i.valor_unitario, 0);
            const total = Math.max(0, totalItens - orc.desconto);
            const vencido = orc.data_validade < hojeStr && orc.status !== "aprovado" && orc.status !== "recusado";
            const statusInfo = orcamentoStatusMap[vencido ? "expirado" : orc.status];
            return (
              <Link key={orc.id} href={`/orcamentos/${orc.id}`} className="flex items-center justify-between gap-3 p-4 active:bg-secondary/50">
                <div className="min-w-0">
                  <p className="font-semibold text-primary">#ORC-{String(orc.numero).padStart(4, "0")}</p>
                  <p className="truncate text-sm font-medium text-foreground">{orc.clientes?.nome ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">Válido até {formatDate(orc.data_validade)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  <p className="text-sm font-semibold text-foreground">{formatCurrency(total)}</p>
                </div>
              </Link>
            );
          })}
          {(orcamentos ?? []).length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">Nenhum orçamento criado ainda.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
