"use client";

import { useMemo, useState } from "react";
import { Search, X, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Cliente } from "@/types";

export interface ClientePickerValue {
  clienteId: string | null;
  nome: string;
  telefone: string;
}

export function ClientePicker({
  clientes,
  onChange,
  error,
}: {
  clientes: Pick<Cliente, "id" | "nome" | "telefone">[];
  onChange: (value: ClientePickerValue) => void;
  error?: string;
}) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [selecionado, setSelecionado] = useState<Pick<Cliente, "id" | "nome" | "telefone"> | null>(null);
  const [open, setOpen] = useState(false);

  const resultados = useMemo(() => {
    if (!nome.trim()) return [];
    const q = nome.trim().toLowerCase();
    return clientes.filter((c) => c.nome.toLowerCase().includes(q) || c.telefone?.includes(q)).slice(0, 6);
  }, [clientes, nome]);

  function selecionar(cliente: Pick<Cliente, "id" | "nome" | "telefone">) {
    setSelecionado(cliente);
    setOpen(false);
    onChange({ clienteId: cliente.id, nome: cliente.nome, telefone: cliente.telefone ?? "" });
  }

  function limparSelecao() {
    setSelecionado(null);
    setNome("");
    onChange({ clienteId: null, nome: "", telefone });
  }

  function alterarNome(valor: string) {
    setNome(valor);
    setOpen(true);
    onChange({ clienteId: null, nome: valor, telefone });
  }

  function alterarTelefone(valor: string) {
    setTelefone(valor);
    onChange({ clienteId: null, nome, telefone: valor });
  }

  if (selecionado) {
    return (
      <div className="rounded-xl border border-primary/30 bg-accent/40 p-3">
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
            onClick={limparSelecao}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-foreground/10"
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
        <Label htmlFor="cliente_nome" className="mb-1.5 block">
          Nome do Cliente
        </Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="cliente_nome"
            autoComplete="off"
            placeholder="Digite o nome para buscar ou cadastrar um novo..."
            className={cn("pl-9 uppercase", error && "border-destructive focus-visible:ring-destructive/20")}
            value={nome}
            onChange={(e) => alterarNome(e.target.value)}
            onFocus={() => setOpen(true)}
            aria-invalid={Boolean(error)}
          />
        </div>
        {error ? (
          <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>
        ) : (
          open &&
          resultados.length === 0 &&
          nome.trim() && <p className="mt-1.5 text-xs text-muted-foreground">Cliente novo — será cadastrado automaticamente.</p>
        )}
        {open && resultados.length > 0 && (
          <div className="mt-1.5 flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            {resultados.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => selecionar(c)}
                className="flex flex-col items-start px-3.5 py-2.5 text-left text-sm hover:bg-secondary"
              >
                <span className="font-medium text-foreground">{c.nome}</span>
                <span className="text-xs text-muted-foreground">{c.telefone}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="cliente_telefone" className="mb-1.5 block">
          Telefone / WhatsApp
        </Label>
        <PhoneInput id="cliente_telefone" placeholder="(27) 90000-0000" onChange={alterarTelefone} />
      </div>
    </div>
  );
}
