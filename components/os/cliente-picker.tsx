"use client";

import { useMemo, useState } from "react";
import { Search, X, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Cliente } from "@/types";

export function ClientePicker({ clientes }: { clientes: Pick<Cliente, "id" | "nome" | "telefone">[] }) {
  const [query, setQuery] = useState("");
  const [selecionado, setSelecionado] = useState<Pick<Cliente, "id" | "nome" | "telefone"> | null>(null);
  const [open, setOpen] = useState(false);

  const resultados = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return clientes.filter((c) => c.nome.toLowerCase().includes(q) || c.telefone?.includes(q)).slice(0, 6);
  }, [clientes, query]);

  if (selecionado) {
    return (
      <div className="rounded-xl border border-primary/30 bg-accent/40 p-3">
        <input type="hidden" name="cliente_id" value={selecionado.id} />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserCheck className="size-4 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">{selecionado.nome}</p>
              <p className="text-xs text-muted-foreground">{selecionado.telefone}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelecionado(null)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-white"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label className="mb-1.5 block">Buscar Cliente Existente</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Nome, CPF ou Telefone..."
            className="pl-9"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
          />
        </div>
        {open && resultados.length > 0 && (
          <div className="mt-1.5 flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-lg">
            {resultados.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelecionado(c);
                  setOpen(false);
                  setQuery("");
                }}
                className="flex flex-col items-start px-3.5 py-2.5 text-left text-sm hover:bg-secondary"
              >
                <span className="font-medium text-foreground">{c.nome}</span>
                <span className="text-xs text-muted-foreground">{c.telefone}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase text-muted-foreground">Ou</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="cliente_nome" className="mb-1.5 block">
            Nome Completo
          </Label>
          <Input id="cliente_nome" name="cliente_nome" placeholder="Nome do cliente" />
        </div>
        <div>
          <Label htmlFor="cliente_telefone" className="mb-1.5 block">
            Telefone / WhatsApp
          </Label>
          <Input id="cliente_telefone" name="cliente_telefone" placeholder="(11) 90000-0000" />
        </div>
      </div>
    </div>
  );
}
