import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Estado vazio padronizado para as listas principais do app — ícone leve
// acima da mensagem, em vez de só uma linha de texto cinza centralizada.
export function EmptyState({
  icon,
  title,
  description,
  className,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2.5 py-10 text-center", className)}>
      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="max-w-xs text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}
