"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientePicker } from "@/components/os/cliente-picker";
import { createOrcamento } from "@/lib/actions";
import type { Cliente } from "@/types";

export function NovaOrcamentoForm({ clientes }: { clientes: Pick<Cliente, "id" | "nome" | "telefone">[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const id = await createOrcamento(formData);
        toast.success("Orçamento criado");
        router.push(`/orcamentos/${id}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao criar orçamento");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientePicker clientes={clientes} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Orçamento</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Label htmlFor="descricao" className="mb-1.5 block">
              Descrição / equipamento
            </Label>
            <Textarea
              id="descricao"
              name="descricao"
              rows={3}
              placeholder="Ex: Troca do motor da máquina de lavar Brastemp 12kg"
              className="uppercase"
            />
          </div>
          <div className="max-w-xs">
            <Label className="mb-1.5 block">Validade do orçamento</Label>
            <Select name="validade_dias" defaultValue="15">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="15">15 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Criar e adicionar itens"}
        </Button>
      </div>
    </form>
  );
}
