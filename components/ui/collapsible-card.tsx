"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STORAGE_PREFIX = "sigo-collapsible-";
// Um único Set de listeners pra todos os cards da página — cada card só se
// importa com a própria chave (lida de novo em getSnapshot quando notificado),
// então não precisa de um canal por card. Mesmo padrão de
// components/layout/app-sidebar.tsx pro "encolher" do menu lateral.
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function lerAberto(id: string, defaultOpen: boolean) {
  try {
    const salvo = localStorage.getItem(STORAGE_PREFIX + id);
    return salvo === null ? defaultOpen : salvo === "1";
  } catch {
    return defaultOpen;
  }
}

function alternarAberto(id: string, atual: boolean) {
  try {
    localStorage.setItem(STORAGE_PREFIX + id, atual ? "0" : "1");
  } catch {
    // modo privado etc — perde só a preferência, não quebra o toggle
  }
  listeners.forEach((callback) => callback());
}

export function CollapsibleCard({
  id,
  icon,
  title,
  meta,
  actions,
  defaultOpen = true,
  className,
  children,
}: {
  /** Chave única do card nessa página — usada só pra lembrar aberto/fechado. */
  id: string;
  icon?: ReactNode;
  title: ReactNode;
  /** Linha de resumo abaixo do título (ex: Previsto/Real) — continua visível mesmo fechado. */
  meta?: ReactNode;
  /** Botões de ação no canto direito do cabeçalho — continuam visíveis mesmo fechado. */
  actions?: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const aberto = useSyncExternalStore(
    subscribe,
    () => lerAberto(id, defaultOpen),
    () => defaultOpen
  );

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => alternarAberto(id, aberto)}
          aria-expanded={aberto}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg text-left"
        >
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              !aberto && "-rotate-90"
            )}
          />
          {icon}
          <div className="min-w-0">
            <CardTitle className="flex flex-wrap items-center gap-2">{title}</CardTitle>
            {meta && <div className="mt-1">{meta}</div>}
          </div>
        </button>
        {actions && <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div>}
      </CardHeader>
      {aberto && <CardContent className="flex flex-col gap-2">{children}</CardContent>}
    </Card>
  );
}
