import Link from "next/link";
import { cn } from "@/lib/utils";
import type { OrcamentoStatus } from "@/types";

const tabs: { value: OrcamentoStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "rascunho", label: "Rascunho" },
  { value: "enviado", label: "Enviado" },
  { value: "aprovado", label: "Aprovado" },
  { value: "recusado", label: "Recusado" },
  { value: "expirado", label: "Expirado" },
];

export function OrcamentoStatusTabs({ active }: { active: string }) {
  return (
    <div className="flex w-full gap-2 overflow-x-auto pb-1">
      {tabs.map((tab) => {
        const isActive = active === tab.value;
        return (
          <Link
            key={tab.value}
            href={tab.value === "todos" ? "/orcamentos" : `/orcamentos?status=${tab.value}`}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-muted-foreground hover:bg-secondary"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
