"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAgendaEvento } from "@/lib/actions";
import type { Cliente } from "@/types";

export function NovoAgendamentoDialog({
  clientes,
  defaultDate,
}: {
  clientes: Pick<Cliente, "id" | "nome">[];
  defaultDate?: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const forcedOpen = searchParams.get("novo") === "1";
  const isOpen = open || forcedOpen;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next && forcedOpen) {
      router.replace("/agenda");
    }
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createAgendaEvento(formData);
        toast.success("Agendamento criado");
        handleOpenChange(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao criar agendamento");
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Novo Agendamento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo agendamento</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="titulo" className="mb-1.5 block">
              Título
            </Label>
            <Input id="titulo" name="titulo" required placeholder="Ex: Avaliação Geladeira Brastemp" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Tipo</Label>
              <Select name="tipo" defaultValue="oficina">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oficina">Oficina</SelectItem>
                  <SelectItem value="servico_domicilio">Serviço em domicílio</SelectItem>
                  <SelectItem value="frete">Frete</SelectItem>
                  <SelectItem value="visita">Visita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Cliente</Label>
              <Select name="cliente_id">
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data" className="mb-1.5 block">
                Data
              </Label>
              <Input id="data" name="data" type="date" required defaultValue={defaultDate} />
            </div>
            <div>
              <Label htmlFor="hora" className="mb-1.5 block">
                Hora
              </Label>
              <Input id="hora" name="hora" type="time" defaultValue="09:00" />
            </div>
          </div>
          <div>
            <Label htmlFor="endereco" className="mb-1.5 block">
              Endereço (se em domicílio)
            </Label>
            <Input id="endereco" name="endereco" />
          </div>
          <div>
            <Label htmlFor="tecnico" className="mb-1.5 block">
              Técnico responsável
            </Label>
            <Input id="tecnico" name="tecnico" />
          </div>
          <div>
            <Label htmlFor="observacoes" className="mb-1.5 block">
              Observações
            </Label>
            <Textarea id="observacoes" name="observacoes" rows={3} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Agendar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
