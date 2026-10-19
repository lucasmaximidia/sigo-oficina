"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Search, ClipboardCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { criarBalancoEstoque } from "@/lib/actions";
import { cn } from "@/lib/utils";
import type { Peca } from "@/types";

function sanitizeInteiro(raw: string) {
  return raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

export function BalancoForm({ pecas }: { pecas: Peca[] }) {
  const [busca, setBusca] = useState("");
  const [soContadas, setSoContadas] = useState(false);
  const [contagens, setContagens] = useState<Record<string, string>>({});
  const [observacao, setObservacao] = useState("");
  const [confirmarOpen, setConfirmarOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const itensContados = useMemo(
    () =>
      pecas
        .filter((peca) => contagens[peca.id] !== undefined && contagens[peca.id] !== "")
        .map((peca) => {
          const contada = parseInt(contagens[peca.id], 10);
          return { peca, contada, diferenca: contada - peca.quantidade };
        }),
    [pecas, contagens]
  );
  const itensDivergentes = itensContados.filter((item) => item.diferenca !== 0);

  const pecasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return pecas.filter((peca) => {
      if (soContadas && (contagens[peca.id] === undefined || contagens[peca.id] === "")) return false;
      if (!termo) return true;
      return peca.nome.toLowerCase().includes(termo) || (peca.codigo?.toLowerCase().includes(termo) ?? false);
    });
  }, [pecas, busca, soContadas, contagens]);

  function handleContagemChange(pecaId: string, raw: string) {
    setContagens((prev) => ({ ...prev, [pecaId]: sanitizeInteiro(raw) }));
  }

  function handleSalvar() {
    startTransition(async () => {
      try {
        await criarBalancoEstoque(
          itensContados.map((item) => ({
            pecaId: item.peca.id,
            pecaNome: item.peca.nome,
            pecaCodigo: item.peca.codigo,
            quantidadeSistema: item.peca.quantidade,
            quantidadeContada: item.contada,
          })),
          observacao
        );
        toast.success(`Balanço salvo — ${itensContados.length} ${itensContados.length === 1 ? "item ajustado" : "itens ajustados"}`);
        setContagens({});
        setObservacao("");
        setConfirmarOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar balanço");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nome ou código..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2.5">
          <Switch id="so-contadas" checked={soContadas} onCheckedChange={setSoContadas} />
          <Label htmlFor="so-contadas" className="text-sm text-muted-foreground">
            Mostrar só itens já contados
          </Label>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item / Código</TableHead>
                <TableHead>Qtd. no Sistema</TableHead>
                <TableHead>Qtd. Contada</TableHead>
                <TableHead>Diferença</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pecasFiltradas.map((peca) => {
                const raw = contagens[peca.id] ?? "";
                const contada = raw === "" ? null : parseInt(raw, 10);
                const diferenca = contada === null ? null : contada - peca.quantidade;
                return (
                  <TableRow key={peca.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">{peca.nome}</p>
                      {peca.codigo && <p className="text-xs text-muted-foreground">COD: {peca.codigo}</p>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{peca.quantidade} unid.</TableCell>
                    <TableCell>
                      <Input
                        inputMode="numeric"
                        placeholder="—"
                        className="w-24"
                        value={raw}
                        onChange={(e) => handleContagemChange(peca.id, e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      {diferenca === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : diferenca === 0 ? (
                        <Badge variant="success">Confere</Badge>
                      ) : (
                        <Badge variant="destructive">{diferenca > 0 ? `+${diferenca}` : diferenca}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {pecasFiltradas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    {pecas.length === 0 ? "Nenhuma peça cadastrada." : "Nenhuma peça encontrada."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col divide-y divide-border md:hidden">
          {pecasFiltradas.map((peca) => {
            const raw = contagens[peca.id] ?? "";
            const contada = raw === "" ? null : parseInt(raw, 10);
            const diferenca = contada === null ? null : contada - peca.quantidade;
            return (
              <div key={peca.id} className="flex flex-col gap-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{peca.nome}</p>
                    {peca.codigo && <p className="text-xs text-muted-foreground">COD: {peca.codigo}</p>}
                  </div>
                  {diferenca !== null &&
                    (diferenca === 0 ? (
                      <Badge variant="success">Confere</Badge>
                    ) : (
                      <Badge variant="destructive">{diferenca > 0 ? `+${diferenca}` : diferenca}</Badge>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Sistema: {peca.quantidade} unid.</span>
                  <Input
                    inputMode="numeric"
                    placeholder="Contagem"
                    className="w-28"
                    value={raw}
                    onChange={(e) => handleContagemChange(peca.id, e.target.value)}
                  />
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
      </div>

      <div className="sticky bottom-4 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-md md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{itensContados.length}</span> {itensContados.length === 1 ? "item contado" : "itens contados"}
          {itensDivergentes.length > 0 && (
            <>
              {" "}
              ·{" "}
              <span className="font-semibold text-destructive">
                {itensDivergentes.length} com diferença
              </span>
            </>
          )}
        </p>
        <Dialog open={confirmarOpen} onOpenChange={setConfirmarOpen}>
          <DialogTrigger asChild>
            <Button type="button" disabled={itensContados.length === 0}>
              <ClipboardCheck className="size-4" />
              Salvar Balanço
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar balanço de estoque?</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                O estoque de <span className="font-semibold text-foreground">{itensContados.length}</span>{" "}
                {itensContados.length === 1 ? "item será ajustado" : "itens será ajustado"} para a quantidade contada.
                Essa ação não pode ser desfeita automaticamente — se precisar corrigir depois, edite a peça manualmente.
              </p>
              {itensDivergentes.length > 0 && (
                <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto rounded-lg bg-secondary p-3">
                  {itensDivergentes.map((item) => (
                    <div key={item.peca.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate text-foreground">{item.peca.nome}</span>
                      <span className={cn("shrink-0 font-medium", item.diferenca > 0 ? "text-success" : "text-destructive")}>
                        {item.peca.quantidade} → {item.contada} ({item.diferenca > 0 ? `+${item.diferenca}` : item.diferenca})
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <Label htmlFor="observacao_balanco" className="mb-1.5 block">
                  Observação (opcional)
                </Label>
                <Input
                  id="observacao_balanco"
                  placeholder="Ex: Conferência mensal de setembro"
                  className="uppercase"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleSalvar} disabled={isPending}>
                {isPending ? "Salvando..." : "Confirmar e ajustar estoque"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
