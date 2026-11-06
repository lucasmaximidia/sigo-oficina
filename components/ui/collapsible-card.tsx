"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLembrarAberto } from "@/lib/use-lembrar-aberto";
import { cn } from "@/lib/utils";

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
  const { aberto, alternar } = useLembrarAberto(id, defaultOpen);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={alternar}
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
