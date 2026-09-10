"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientePicker } from "@/components/os/cliente-picker";
import { createOrcamento } from "@/lib/actions";
import type { Cliente } from "@/types";

const novoOrcamentoSchema = z
  .object({
    clienteId: z.string().nullable(),
    clienteNome: z.string(),
    clienteTelefone: z.string(),
    descricao: z.string().optional(),
    validadeDias: z.enum(["7", "15", "30"]),
  })
  .refine((data) => Boolean(data.clienteId) || data.clienteNome.trim().length > 0, {
    message: "Informe o nome do cliente ou selecione um cliente existente",
    path: ["clienteNome"],
  });

type NovoOrcamentoValues = z.infer<typeof novoOrcamentoSchema>;

export function NovaOrcamentoForm({ clientes }: { clientes: Pick<Cliente, "id" | "nome" | "telefone">[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<NovoOrcamentoValues>({
    resolver: zodResolver(novoOrcamentoSchema),
    defaultValues: {
      clienteId: null,
      clienteNome: "",
      clienteTelefone: "",
      descricao: "",
      validadeDias: "15",
    },
  });

  function onSubmit(values: NovoOrcamentoValues) {
    startTransition(async () => {
      try {
        const formData = new FormData();
        if (values.clienteId) formData.set("cliente_id", values.clienteId);
        formData.set("cliente_nome", values.clienteNome);
        formData.set("cliente_telefone", values.clienteTelefone);
        formData.set("descricao", values.descricao ?? "");
        formData.set("validade_dias", values.validadeDias);

        const id = await createOrcamento(formData);
        toast.success("Orçamento criado");
        router.push(`/orcamentos/${id}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao criar orçamento");
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
            <FileText className="size-4.5 text-primary" />
            Detalhes do Orçamento
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Label htmlFor="descricao" className="mb-1.5 block">
              Descrição / equipamento
            </Label>
            <Textarea
              id="descricao"
              rows={3}
              placeholder="Ex: Troca do motor da máquina de lavar Brastemp 12kg"
              className="uppercase"
              {...register("descricao")}
            />
          </div>
          <div className="max-w-xs">
            <Label className="mb-1.5 block">Validade do orçamento</Label>
            <Controller
              control={control}
              name="validadeDias"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
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
