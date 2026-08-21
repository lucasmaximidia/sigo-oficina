import Link from "next/link";
import { cn } from "@/lib/utils";
import type { OsStatus } from "@/types";

const tabs: { value: OsStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "aguardando_orcamento", label: "Aguardando orçamento" },
  { value: "em_execucao", label: "Em execução" },
  { value: "aguardando_pecas", label: "Aguardando peças" },
  { value: "aguardando_pagamento", label: "Aguardando pagamento" },
  { value: "finalizado", label: "Finalizado" },
];

export function OsStatusTabs({ active }: { active: string }) {
  return (
    <div className="flex w-full gap-2 overflow-x-auto pb-1">
      {tabs.map((tab) => {
        const isActive = active === tab.value;
        return (
          <Link
            key={tab.value}
            href={tab.value === "todos" ? "/ordens-servico" : `/ordens-servico?status=${tab.value}`}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-white text-muted-foreground hover:bg-secondary"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
