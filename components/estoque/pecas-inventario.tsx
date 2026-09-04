"use client";

import { useMemo, useState } from "react";
import { Search, Tag, Pencil, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PecaDialog } from "@/components/estoque/peca-dialog";
import { formatCurrency, cn } from "@/lib/utils";
import type { LojaParceira, Peca } from "@/types";

function statusPeca(quantidade: number, minimo: number) {
  if (quantidade === 0) return { label: "Crítico", variant: "destructive" as const };
  if (quantidade <= minimo) return { label: "Baixo", variant: "warning" as const };
  return { label: "Adequado", variant: "success" as const };
}

const MARGEM_BAIXA_LIMITE = 20;

type FiltroProblema = "baixo_critico" | "sem_venda" | "margem_baixa" | "prejuizo";

const FILTROS: { id: FiltroProblema; label: string }[] = [
  { id: "baixo_critico", label: "Estoque baixo/crítico" },
  { id: "sem_venda", label: "Sem valor de venda" },
  { id: "margem_baixa", label: `Margem baixa (< ${MARGEM_BAIXA_LIMITE}%)` },
  { id: "prejuizo", label: "Vendendo com prejuízo" },
];

function pecaAtendeFiltro(peca: Peca, filtro: FiltroProblema) {
  const lucro = peca.preco_venda - peca.preco_custo;
  const margem = peca.preco_venda > 0 ? (lucro / peca.preco_venda) * 100 : 0;
  switch (filtro) {
    case "baixo_critico":
      return peca.quantidade <= peca.quantidade_minima;
    case "sem_venda":
      return peca.preco_venda === 0;
    case "margem_baixa":
      return peca.preco_venda > 0 && margem < MARGEM_BAIXA_LIMITE;
    case "prejuizo":
      return lucro < 0;
  }
}

export function PecasInventario({ pecas, lojas }: { pecas: Peca[]; lojas: LojaParceira[] }) {
  const [busca, setBusca] = useState("");
  const [filtrosAtivos, setFiltrosAtivos] = useState<Set<FiltroProblema>>(new Set());
  const [editandoId, setEditandoId] = useState<string | null>(null);

  function toggleFiltro(id: FiltroProblema) {
    setFiltrosAtivos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const pecasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return pecas.filter((peca) => {
      if (filtrosAtivos.size > 0 && ![...filtrosAtivos].some((filtro) => pecaAtendeFiltro(peca, filtro))) return false;
      if (!termo) return true;
      return peca.nome.toLowerCase().includes(termo) || (peca.codigo?.toLowerCase().includes(termo) ?? false);
    });
  }, [pecas, busca, filtrosAtivos]);

  return (
    <>
      <div className="flex flex-col gap-3 border-b border-border p-4 md:p-5 md:pt-0">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nome ou código..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTROS.map((filtro) => {
            const ativo = filtrosAtivos.has(filtro.id);
            return (
              <button
                key={filtro.id}
                type="button"
                onClick={() => toggleFiltro(filtro.id)}
                aria-pressed={ativo}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  ativo
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input bg-card text-muted-foreground hover:bg-secondary"
                )}
              >
                {filtro.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item / Código</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Custo / Venda</TableHead>
              <TableHead>Lucro Unitário</TableHead>
              <TableHead className="w-10">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pecasFiltradas.map((peca) => {
              const status = statusPeca(peca.quantidade, peca.quantidade_minima);
              const lucroUnitario = peca.preco_venda - peca.preco_custo;
              const margem = peca.preco_venda > 0 ? (lucroUnitario / peca.preco_venda) * 100 : 0;
              return (
                <TableRow key={peca.id}>
                  <TableCell className="whitespace-normal">
                    <p className="font-medium text-foreground">{peca.nome}</p>
                    {peca.codigo && <p className="whitespace-nowrap text-xs text-muted-foreground">COD: {peca.codigo}</p>}
                  </TableCell>
                  <TableCell>
                    <p className="text-foreground">{peca.quantidade} unid.</p>
                    <Badge variant={status.variant} className="mt-1">
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-muted-foreground">Custo: {formatCurrency(peca.preco_custo)}</p>
                    <p className="text-foreground">Venda: {formatCurrency(peca.preco_venda)}</p>
                  </TableCell>
                  <TableCell>
                    <p className={cn("font-medium", lucroUnitario >= 0 ? "text-success" : "text-destructive")}>
                      {formatCurrency(lucroUnitario)}
                    </p>
                    <p className="text-xs text-muted-foreground">{margem.toFixed(0)}% de margem</p>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" aria-label="Mais ações">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <a href={`/api/estoque/${peca.id}/etiqueta`} target="_blank" rel="noopener noreferrer">
                            <Tag className="size-4" />
                            Baixar etiqueta
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setEditandoId(peca.id)}>
                          <Pencil className="size-4" />
                          Editar peça
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <PecaDialog
                      peca={peca}
                      lojas={lojas}
                      hideTrigger
                      open={editandoId === peca.id}
                      onOpenChange={(value) => setEditandoId(value ? peca.id : null)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {pecasFiltradas.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  {pecas.length === 0 ? "Nenhuma peça cadastrada." : "Nenhuma peça encontrada."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col divide-y divide-border md:hidden">
        {pecasFiltradas.map((peca) => {
          const status = statusPeca(peca.quantidade, peca.quantidade_minima);
          const lucroUnitario = peca.preco_venda - peca.preco_custo;
          return (
            <div key={peca.id} className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{peca.nome}</p>
                {peca.codigo && <p className="text-xs text-muted-foreground">COD: {peca.codigo}</p>}
                <div className="mt-1.5 flex items-center gap-2">
                  <Badge variant={status.variant}>{status.label}</Badge>
                  <span className="text-xs text-muted-foreground">{peca.quantidade} unid.</span>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Custo {formatCurrency(peca.preco_custo)} · Venda {formatCurrency(peca.preco_venda)}
                </p>
                <p className={cn("mt-0.5 text-xs font-medium", lucroUnitario >= 0 ? "text-success" : "text-destructive")}>
                  Lucro {formatCurrency(lucroUnitario)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button size="icon" variant="ghost" aria-label="Baixar etiqueta" asChild>
                  <a href={`/api/estoque/${peca.id}/etiqueta`} target="_blank" rel="noopener noreferrer">
                    <Tag className="size-4" />
                  </a>
                </Button>
                <PecaDialog peca={peca} lojas={lojas} />
              </div>
            </div>
          );
        })}
        {pecasFiltradas.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {pecas.length === 0 ? "Nenhuma peça cadastrada." : "Nenhuma peça encontrada."}
          </p>
        )}
      </div>
    </>
  );
}
