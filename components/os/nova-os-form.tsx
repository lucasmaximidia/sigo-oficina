"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Wrench, MessageSquareText } from "lucide-react";
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

const novaOsSchema = z
  .object({
    clienteId: z.string().nullable(),
    clienteNome: z.string(),
    clienteTelefone: z.string(),
    equipamentoTipo: z.string().optional(),
    equipamentoMarca: z.string().optional(),
    equipamentoModelo: z.string().optional(),
    equipamentoSerie: z.string().optional(),
    problemaRelatado: z.string().optional(),
    urgencia: z.enum(["baixa", "media", "alta"]),
    origem: z.enum(["balcao", "domicilio", "frete"]),
    dataEntrada: z.string().optional(),
  })
  .refine((data) => Boolean(data.clienteId) || data.clienteNome.trim().length > 0, {
    message: "Informe o nome do cliente ou selecione um cliente existente",
    path: ["clienteNome"],
  });

type NovaOsValues = z.infer<typeof novaOsSchema>;

export function NovaOsForm({ clientes }: { clientes: Pick<Cliente, "id" | "nome" | "telefone">[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<NovaOsValues>({
    resolver: zodResolver(novaOsSchema),
    defaultValues: {
      clienteId: null,
      clienteNome: "",
      clienteTelefone: "",
      equipamentoTipo: undefined,
      equipamentoMarca: "",
      equipamentoModelo: "",
      equipamentoSerie: "",
      problemaRelatado: "",
      urgencia: "media",
      origem: "balcao",
      dataEntrada: new Date().toISOString().slice(0, 10),
    },
  });

  function onSubmit(values: NovaOsValues) {
    startTransition(async () => {
      try {
        const formData = new FormData();
        if (values.clienteId) formData.set("cliente_id", values.clienteId);
        formData.set("cliente_nome", values.clienteNome);
        formData.set("cliente_telefone", values.clienteTelefone);
        formData.set("equipamento_tipo", values.equipamentoTipo ?? "");
        formData.set("equipamento_marca", values.equipamentoMarca ?? "");
        formData.set("equipamento_modelo", values.equipamentoModelo ?? "");
        formData.set("equipamento_serie", values.equipamentoSerie ?? "");
        formData.set("problema_relatado", values.problemaRelatado ?? "");
        formData.set("urgencia", values.urgencia);
        formData.set("origem", values.origem);
        formData.set("data_entrada", values.dataEntrada ?? "");

        const id = await createOrdemServico(formData);
        toast.success("OS criada com sucesso");
        router.push(`/ordens-servico/${id}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao criar OS");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-4.5 text-primary" />
            Dados do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ClientePicker
            clientes={clientes}
            error={errors.clienteNome?.message}
            onChange={({ clienteId, nome, telefone }) => {
              setValue("clienteId", clienteId);
              setValue("clienteNome", nome, { shouldValidate: true });
              setValue("clienteTelefone", telefone);
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="size-4.5 text-primary" />
            Dados do Equipamento
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label className="mb-1.5 block">Tipo de Máquina</Label>
            <Controller
              control={control}
              name="equipamentoTipo"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
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
              )}
            />
          </div>
          <div>
            <Label htmlFor="equipamento_marca" className="mb-1.5 block">
              Marca
            </Label>
            <Input id="equipamento_marca" placeholder="Ex: Brastemp" className="uppercase" {...register("equipamentoMarca")} />
          </div>
          <div>
            <Label htmlFor="equipamento_modelo" className="mb-1.5 block">
              Modelo
            </Label>
            <Input id="equipamento_modelo" placeholder="Ex: BWH12AB" className="uppercase" {...register("equipamentoModelo")} />
          </div>
          <div className="sm:col-span-3">
            <Label htmlFor="equipamento_serie" className="mb-1.5 block">
              Número de série (opcional)
            </Label>
            <Input id="equipamento_serie" placeholder="S/N" className="uppercase" {...register("equipamentoSerie")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareText className="size-4.5 text-primary" />
            Relato do Problema
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Label htmlFor="problema_relatado" className="mb-1.5 block">
              Descrição detalhada
            </Label>
            <Textarea
              id="problema_relatado"
              placeholder="Descreva o problema relatado pelo cliente..."
              rows={4}
              className="uppercase"
              {...register("problemaRelatado")}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label className="mb-1.5 block">Urgência</Label>
              <Controller
                control={control}
                name="urgencia"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Origem</Label>
              <Controller
                control={control}
                name="origem"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balcao">Balcão</SelectItem>
                      <SelectItem value="domicilio">Serviço em domicílio</SelectItem>
                      <SelectItem value="frete">Frete / coleta</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="data_entrada" className="mb-1.5 block">
                Data de entrada
              </Label>
              <Input
                id="data_entrada"
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                {...register("dataEntrada")}
              />
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
