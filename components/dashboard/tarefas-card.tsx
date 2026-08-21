"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createTarefa, toggleTarefa } from "@/lib/actions";
import type { Tarefa } from "@/types";

export function TarefasCard({ tarefas }: { tarefas: Tarefa[] }) {
  const [novoTitulo, setNovoTitulo] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle>O que fazer hoje</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {tarefas.length === 0 && (
          <p className="py-2 text-sm text-muted-foreground">Nenhuma tarefa para hoje.</p>
        )}
        {tarefas.map((tarefa) => (
          <label
            key={tarefa.id}
            className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-secondary/60"
          >
            <Checkbox
              checked={tarefa.concluida}
              onCheckedChange={(checked) =>
                startTransition(() => {
                  toggleTarefa(tarefa.id, checked === true);
                })
              }
              className="mt-0.5"
            />
            <span
              className={cn(
                "text-sm",
                tarefa.concluida ? "text-muted-foreground line-through" : "text-foreground"
              )}
            >
              {tarefa.titulo}
            </span>
          </label>
        ))}

        <form
          className="mt-2 flex items-center gap-2 border-t border-border pt-3"
          action={(formData) => {
            startTransition(() => {
              createTarefa(formData);
            });
            setNovoTitulo("");
          }}
        >
          <Input
            name="titulo"
            value={novoTitulo}
            onChange={(e) => setNovoTitulo(e.target.value)}
            placeholder="Adicionar tarefa..."
            className="h-9"
          />
          <Button type="submit" size="sm" variant="ghost" disabled={isPending || !novoTitulo.trim()}>
            <Plus className="size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
