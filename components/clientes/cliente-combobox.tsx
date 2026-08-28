"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Cliente } from "@/types";

export function ClienteCombobox({
  clientes,
  value,
  onValueChange,
  placeholder = "Nenhum",
}: {
  clientes: Pick<Cliente, "id" | "nome">[];
  value: string;
  onValueChange: (id: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState("");

  const selecionado = clientes.find((c) => c.id === value);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return clientes;
    return clientes.filter((c) => c.nome.toLowerCase().includes(termo));
  }, [clientes, busca]);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setBusca("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-card px-3.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          <span className={cn("truncate", !selecionado && "text-muted-foreground")}>
            {selecionado ? selecionado.nome : placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <div className="border-b border-border p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar cliente..."
              className="h-8 pl-8 text-sm"
            />
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          <button
            type="button"
            onClick={() => {
              onValueChange("");
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-secondary"
          >
            <Check className={cn("size-4", value ? "opacity-0" : "opacity-100")} />
            Nenhum
          </button>
          {filtrados.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onValueChange(c.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-secondary"
            >
              <Check className={cn("size-4", value === c.id ? "opacity-100" : "opacity-0")} />
              <span className="truncate">{c.nome}</span>
            </button>
          ))}
          {filtrados.length === 0 && (
            <p className="px-2.5 py-4 text-center text-xs text-muted-foreground">Nenhum cliente encontrado.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
