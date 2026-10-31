"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { labelMes } from "@/lib/pessoal-status";
import { somarMeses } from "@/lib/pessoal-datas";

export function MesSeletor({ mes, basePath }: { mes: string; basePath: string }) {
  const router = useRouter();
  const anterior = somarMeses(mes, -1);
  const proximo = somarMeses(mes, 1);

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline" size="icon">
        <Link href={`${basePath}?mes=${anterior}`} aria-label="Mês anterior">
          <ChevronLeft className="size-4" />
        </Link>
      </Button>
      <div className="flex min-w-40 items-center justify-center">
        <input
          type="month"
          value={mes.slice(0, 7)}
          onChange={(e) => {
            if (!e.target.value) return;
            router.push(`${basePath}?mes=${e.target.value}-01`);
          }}
          className="rounded-lg border border-input bg-card px-3 py-2 text-sm font-semibold text-foreground"
          aria-label="Selecionar mês"
        />
      </div>
      <Button asChild variant="outline" size="icon">
        <Link href={`${basePath}?mes=${proximo}`} aria-label="Próximo mês">
          <ChevronRight className="size-4" />
        </Link>
      </Button>
      <span className="ml-1 text-sm text-muted-foreground">{labelMes(mes)}</span>
    </div>
  );
}
