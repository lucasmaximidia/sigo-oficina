"use client";

import { useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateOrcamentoStatus } from "@/lib/actions";
import { orcamentoStatusMap } from "@/lib/status";
import type { OrcamentoStatus } from "@/types";

const opcoes: OrcamentoStatus[] = ["rascunho", "enviado", "aprovado", "recusado", "expirado"];

export function OrcamentoStatusMenu({ orcamentoId, status }: { orcamentoId: string; status: OrcamentoStatus }) {
  const [isPending, startTransition] = useTransition();
  const info = orcamentoStatusMap[status];

  function handleChange(next: OrcamentoStatus) {
    startTransition(async () => {
      try {
        await updateOrcamentoStatus(orcamentoId, next);
        toast.success("Status atualizado");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao atualizar status");
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isPending} className="gap-2">
          <Badge variant={info.variant}>{info.label}</Badge>
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {opcoes.map((op) => (
          <DropdownMenuItem key={op} onSelect={() => handleChange(op)} disabled={op === status}>
            {orcamentoStatusMap[op].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
