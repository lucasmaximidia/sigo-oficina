"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { criarNotaFiscalAvulsa } from "@/lib/notas-fiscais-actions";
import type { Cliente } from "@/types";

type ClienteBusca = Pick<Cliente, "id" | "nome" | "cpf_cnpj">;

export function NotaFiscalAvulsaDialog({ clientes }: { clientes: ClienteBusca[] }) {
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [documento, setDocumento] = useState("");
  const [valor, setValor] = useState(0);
  const [isPending, startTransition] = useTransition();

  const resultados = useMemo(() => {
    if (clienteId || !busca.trim()) return [];
    const q = busca.trim().toLowerCase();
    return clientes.filter((c) => c.nome.toLowerCase().includes(q)).slice(0, 6);
  }, [clientes, busca, clienteId]);

  function selecionar(cliente: ClienteBusca) {
    setClienteId(cliente.id);
    setBusca(cliente.nome);
    setDocumento(cliente.cpf_cnpj ?? "");
  }

  function limpar() {
    setBusca("");
    setClienteId(null);
    setDocumento("");
    setValor(0);
  }

  function handleSubmit() {
    if (!busca.trim()) {
      toast.error("Informe o nome do cliente");
      return;
    }
    if (valor <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    startTransition(async () => {
      try {
        await criarNotaFiscalAvulsa({
          clienteId,
          clienteNome: busca,
          clienteDocumento: documento || null,
          valor,
        });
        toast.success("Nota fiscal avulsa lançada");
        setOpen(false);
        limpar();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao lançar nota fiscal");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) limpar();
      }}
    >
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="size-4" />
          Nota Avulsa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Emitir nota fiscal avulsa</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Use isso pra lançar uma nota fiscal que não está vinculada a uma OS ou venda do PDV.
          </p>
          <div>
            <Label className="mb-1.5 block">Cliente</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoComplete="off"
                placeholder="Buscar cliente ou digitar o nome..."
                className="pl-9 uppercase"
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setClienteId(null);
                }}
              />
              {clienteId && (
                <button
                  type="button"
                  onClick={limpar}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            {resultados.length > 0 && (
              <div className="mt-1.5 flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                {resultados.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selecionar(c)}
                    className="px-3.5 py-2.5 text-left text-sm hover:bg-secondary"
                  >
                    {c.nome}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="documento" className="mb-1.5 block">
              CPF/CNPJ (opcional)
            </Label>
            <Input id="documento" value={documento} onChange={(e) => setDocumento(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="valor" className="mb-1.5 block">
              Valor (R$)
            </Label>
            <NumericInput id="valor" defaultValue={valor} onValueChange={setValor} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Lançando..." : "Lançar nota fiscal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
