"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Versão "dentro da casca": mantém sidebar/topbar (renderizados pelo
// AppLayout ao redor), só o conteúdo principal é substituído — captura
// erros de qualquer página autenticada sem derrubar a navegação.
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" strokeWidth={2.25} />
      </div>
      <h1 className="font-display text-xl font-bold text-foreground">Algo deu errado</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Ocorreu um erro ao carregar esta página. Você pode tentar novamente.
      </p>
      <Button onClick={() => reset()} className="mt-2">
        <RotateCcw className="size-4" />
        Tentar novamente
      </Button>
    </div>
  );
}
