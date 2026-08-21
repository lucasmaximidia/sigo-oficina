"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientePicker } from "./cliente-picker";
import { createOrdemServico } from "@/lib/actions";
import type { Cliente } from "@/types";

const tiposEquipamento = [
  "Máquina de Lavar",
  "Lava e Seca",
  "Lava Louça",
  "Geladeira / Refrigerador",
  "Ar Condicionado",
  "Forno",
  "Bomba d'Água",
  "Outro",
];

export function NovaOsForm({ clientes }: { clientes: Pick<Cliente, "id" | "nome" | "telefone">[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const id = await createOrdemServico(formData);
        toast.success("OS criada com sucesso");
        router.push(`/ordens-servico/${id}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao criar OS");
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
          <CardTitle>Dados do Equipamento</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label className="mb-1.5 block">Tipo de Máquina</Label>
            <Select name="equipamento_tipo">
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {tiposEquipamento.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="equipamento_marca" className="mb-1.5 block">
              Marca
            </Label>
            <Input id="equipamento_marca" name="equipamento_marca" placeholder="Ex: Brastemp" />
          </div>
          <div>
            <Label htmlFor="equipamento_modelo" className="mb-1.5 block">
              Modelo
            </Label>
            <Input id="equipamento_modelo" name="equipamento_modelo" placeholder="Ex: BWH12AB" />
          </div>
          <div className="sm:col-span-3">
            <Label htmlFor="equipamento_serie" className="mb-1.5 block">
              Número de série (opcional)
            </Label>
            <Input id="equipamento_serie" name="equipamento_serie" placeholder="S/N" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Relato do Problema</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Label htmlFor="problema_relatado" className="mb-1.5 block">
              Descrição detalhada
            </Label>
            <Textarea
              id="problema_relatado"
              name="problema_relatado"
              placeholder="Descreva o problema relatado pelo cliente..."
              rows={4}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">Urgência</Label>
              <Select name="urgencia" defaultValue="media">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Origem</Label>
              <Select name="origem" defaultValue="balcao">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balcao">Balcão</SelectItem>
                  <SelectItem value="domicilio">Serviço em domicílio</SelectItem>
                  <SelectItem value="frete">Frete / coleta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar e continuar"}
        </Button>
      </div>
    </form>
  );
}
