"use client";

import { useTransition } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { osStatusSteps } from "@/lib/status";
import { updateOrdemServicoStatus } from "@/lib/actions";
import type { OsStatus } from "@/types";

export function OsStepIndicator({ osId, status }: { osId: string; status: OsStatus }) {
  const [isPending, startTransition] = useTransition();
  const currentIndex = osStatusSteps.findIndex((s) => s.value === status);

  function handleChange(next: OsStatus) {
    startTransition(async () => {
      try {
        await updateOrdemServicoStatus(osId, next);
        toast.success("Status atualizado");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao atualizar status");
      }
    });
  }

  if (status === "cancelado") {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <p className="text-sm font-semibold text-destructive">Esta ordem de serviço foi cancelada.</p>
        <StatusMenu status={status} isPending={isPending} onChange={handleChange} />
      </div>
    );
  }

  function handleVoltar() {
    if (currentIndex > 0) handleChange(osStatusSteps[currentIndex - 1].value);
  }

  function handleAvancar() {
    if (currentIndex >= 0 && currentIndex < osStatusSteps.length - 1) {
      handleChange(osStatusSteps[currentIndex + 1].value);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center overflow-x-auto">
          {osStatusSteps.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <div key={step.value} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleChange(step.value)}
                className="flex shrink-0 flex-col items-center gap-1.5"
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                    done && "border-primary bg-primary text-primary-foreground",
                    active && "border-primary bg-white text-primary",
                    !done && !active && "border-border bg-white text-muted-foreground"
                  )}
                >
                  {done ? <Check className="size-4" /> : index + 1}
                </span>
                <span
                  className={cn(
                    "hidden whitespace-nowrap text-xs font-medium sm:block",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </button>
              {index < osStatusSteps.length - 1 && (
                <div className={cn("mx-1 h-0.5 flex-1", done ? "bg-primary" : "bg-border")} />
              )}
            </div>
          );
          })}
        </div>
        <StatusMenu status={status} isPending={isPending} onChange={handleChange} />
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={isPending || currentIndex <= 0} onClick={handleVoltar}>
          <ChevronLeft className="size-4" />
          Voltar Etapa
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending || currentIndex < 0 || currentIndex >= osStatusSteps.length - 1}
          onClick={handleAvancar}
        >
          Avançar Etapa
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function StatusMenu({
  status,
  isPending,
  onChange,
}: {
  status: OsStatus;
  isPending: boolean;
  onChange: (status: OsStatus) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isPending} className="shrink-0">
          Alterar Status
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {osStatusSteps.map((step) => (
          <DropdownMenuItem key={step.value} onSelect={() => onChange(step.value)} disabled={step.value === status}>
            {step.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onSelect={() => onChange("cancelado")} variant="destructive">
          Cancelar OS
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
