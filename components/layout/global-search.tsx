"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, User, Wrench, Package, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { SearchResultado } from "@/app/api/search/route";

const iconePorTipo: Record<SearchResultado["tipo"], typeof User> = {
  cliente: User,
  os: Wrench,
  peca: Package,
};

const labelPorTipo: Record<SearchResultado["tipo"], string> = {
  cliente: "Cliente",
  os: "Ordem de Serviço",
  peca: "Peça",
};

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<SearchResultado[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecionado, setSelecionado] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, [open]);

  useEffect(() => {
    const trimmed = query.trim();
    const id = setTimeout(async () => {
      if (trimmed.length < 2) {
        setResultados([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        setResultados(data.resultados ?? []);
        setSelecionado(0);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [query]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setQuery("");
      setResultados([]);
      setSelecionado(0);
    }
  }

  const navegarPara = useCallback(
    (resultado: SearchResultado) => {
      setOpen(false);
      router.push(resultado.href);
    },
    [router]
  );

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelecionado((prev) => Math.min(prev + 1, resultados.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelecionado((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && resultados[selecionado]) {
      e.preventDefault();
      navegarPara(resultados[selecionado]);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative hidden h-10 max-w-sm flex-1 items-center gap-2 rounded-xl border border-input bg-white px-3 text-left text-sm text-muted-foreground/70 shadow-sm hover:border-primary/40 sm:flex"
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1">Buscar cliente, OS, peça...</span>
        <kbd className="hidden shrink-0 rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline-block">
          Ctrl K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="gap-0 p-0 sm:max-w-lg" showClose={false}>
          <DialogHeader className="border-b border-border px-4 py-3">
            <DialogTitle className="sr-only">Busca</DialogTitle>
            <div className="flex items-center gap-2.5">
              <Search className="size-4.5 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Buscar por cliente, número da OS ou peça..."
                className="h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
              />
              {loading && <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />}
            </div>
          </DialogHeader>

          <div className="max-h-80 overflow-y-auto p-2">
            {query.trim().length >= 2 && !loading && resultados.length === 0 && (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">Nenhum resultado encontrado.</p>
            )}
            {query.trim().length < 2 && (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">Digite ao menos 2 letras para buscar.</p>
            )}
            {resultados.map((resultado, index) => {
              const Icon = iconePorTipo[resultado.tipo];
              return (
                <button
                  key={`${resultado.tipo}-${resultado.id}`}
                  type="button"
                  onClick={() => navegarPara(resultado)}
                  onMouseEnter={() => setSelecionado(index)}
                  className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left ${
                    index === selecionado ? "bg-secondary" : ""
                  }`}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{resultado.titulo}</p>
                    <p className="truncate text-xs text-muted-foreground">{resultado.subtitulo}</p>
                  </div>
                  <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
                    {labelPorTipo[resultado.tipo]}
                  </span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
