"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Tag, Pencil, MoreVertical, Download, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [lojaSelecionada, setLojaSelecionada] = useState("todas");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [baixandoEtiquetas, setBaixandoEtiquetas] = useState(false);

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
      if (lojaSelecionada !== "todas" && peca.fornecedor_id !== lojaSelecionada) return false;
      if (filtrosAtivos.size > 0 && ![...filtrosAtivos].some((filtro) => pecaAtendeFiltro(peca, filtro))) return false;
      if (!termo) return true;
      return peca.nome.toLowerCase().includes(termo) || (peca.codigo?.toLowerCase().includes(termo) ?? false);
    });
  }, [pecas, busca, filtrosAtivos, lojaSelecionada]);

  const todosVisiveisSelecionados =
    pecasFiltradas.length > 0 && pecasFiltradas.every((peca) => selecionados.has(peca.id));
  const algumVisivelSelecionado = pecasFiltradas.some((peca) => selecionados.has(peca.id));

  function toggleSelecionado(id: string) {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleTodosVisiveis() {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (todosVisiveisSelecionados) {
        pecasFiltradas.forEach((peca) => next.delete(peca.id));
      } else {
        pecasFiltradas.forEach((peca) => next.add(peca.id));
      }
      return next;
    });
  }

  async function baixarEtiquetasSelecionadas() {
    const ids = Array.from(selecionados);
    if (ids.length === 0) return;

    setBaixandoEtiquetas(true);
    try {
      const response = await fetch("/api/estoque/etiquetas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Erro ao gerar as etiquetas");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "etiquetas.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao baixar etiquetas");
    } finally {
      setBaixandoEtiquetas(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3 border-b border-border p-4 md:p-5 md:pt-0">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por nome ou código..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <Select value={lojaSelecionada} onValueChange={setLojaSelecionada}>
            <SelectTrigger className="sm:w-56">
              <SelectValue placeholder="Todas as lojas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as lojas</SelectItem>
              {lojas.map((loja) => (
                <SelectItem key={loja.id} value={loja.id}>
                  {loja.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

        {selecionados.size > 0 && (
          <div className="flex items-center gap-2.5 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2">
            <p className="flex-1 text-sm font-medium text-foreground">
              {selecionados.size} {selecionados.size === 1 ? "peça selecionada" : "peças selecionadas"}
            </p>
            <Button type="button" size="sm" variant="ghost" onClick={() => setSelecionados(new Set())}>
              <X className="size-3.5" />
              Limpar
            </Button>
            <Button type="button" size="sm" onClick={baixarEtiquetasSelecionadas} disabled={baixandoEtiquetas}>
              <Download className="size-4" />
              {baixandoEtiquetas ? "Gerando..." : "Baixar etiquetas"}
            </Button>
          </div>
        )}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <Checkbox
                  checked={todosVisiveisSelecionados ? true : algumVisivelSelecionado ? "indeterminate" : false}
                  onCheckedChange={toggleTodosVisiveis}
                  aria-label="Selecionar todas as peças"
                />
              </TableHead>
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
                  <TableCell>
                    <Checkbox
                      checked={selecionados.has(peca.id)}
                      onCheckedChange={() => toggleSelecionado(peca.id)}
                      aria-label={`Selecionar ${peca.nome}`}
                    />
                  </TableCell>
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
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
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
            <div key={peca.id} className="flex items-start gap-3 p-4">
              <Checkbox
                checked={selecionados.has(peca.id)}
                onCheckedChange={() => toggleSelecionado(peca.id)}
                aria-label={`Selecionar ${peca.nome}`}
                className="mt-0.5 shrink-0"
              />
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
