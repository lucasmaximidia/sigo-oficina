"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
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
import { NovoClienteDialog } from "@/components/clientes/novo-cliente-dialog";
import { ClienteCombobox } from "@/components/clientes/cliente-combobox";
import { updateAgendaEvento } from "@/lib/actions";
import { agendaStatusMap } from "@/lib/status";
import type { AgendaEvento, AgendaStatus, Cliente } from "@/types";

export function EditarAgendamentoDialog({
  evento,
  clientes: clientesIniciais,
}: {
  evento: AgendaEvento;
  clientes: Pick<Cliente, "id" | "nome">[];
}) {
  const [open, setOpen] = useState(false);
  const [clientes, setClientes] = useState(clientesIniciais);
  const [clienteId, setClienteId] = useState(evento.cliente_id ?? "");
  const [isPending, startTransition] = useTransition();

  const inicio = new Date(evento.data_hora_inicio);
  const dataDefault = evento.data_hora_inicio.slice(0, 10);
  const horaDefault = inicio.toTimeString().slice(0, 5);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateAgendaEvento(evento.id, formData);
        toast.success("Agendamento atualizado");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao atualizar agendamento");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="icon" variant="ghost" aria-label="Editar agendamento">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar agendamento</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="edit_titulo" className="mb-1.5 block">
              Título
            </Label>
            <Input id="edit_titulo" name="titulo" required defaultValue={evento.titulo} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Tipo</Label>
              <Select name="tipo" defaultValue={evento.tipo}>
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
              <Label className="mb-1.5 block">Status</Label>
              <Select name="status" defaultValue={evento.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(agendaStatusMap) as AgendaStatus[]).map((status) => (
                    <SelectItem key={status} value={status}>
                      {agendaStatusMap[status].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Cliente</Label>
            <input type="hidden" name="cliente_id" value={clienteId} />
            <ClienteCombobox clientes={clientes} value={clienteId} onValueChange={setClienteId} />
            <NovoClienteDialog
              onCreated={(id, nome) => {
                setClientes((prev) => [...prev, { id, nome }]);
                setClienteId(id);
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit_data" className="mb-1.5 block">
                Data
              </Label>
              <Input id="edit_data" name="data" type="date" required defaultValue={dataDefault} />
            </div>
            <div>
              <Label htmlFor="edit_hora" className="mb-1.5 block">
                Hora
              </Label>
              <Input id="edit_hora" name="hora" type="time" defaultValue={horaDefault} />
            </div>
          </div>
          <div>
            <Label htmlFor="edit_endereco" className="mb-1.5 block">
              Endereço (se em domicílio)
            </Label>
            <Input id="edit_endereco" name="endereco" defaultValue={evento.endereco ?? ""} />
          </div>
          <div>
            <Label htmlFor="edit_tecnico" className="mb-1.5 block">
              Técnico responsável
            </Label>
            <Input id="edit_tecnico" name="tecnico" defaultValue={evento.tecnico ?? ""} />
          </div>
          <div>
            <Label htmlFor="edit_observacoes" className="mb-1.5 block">
              Observações
            </Label>
            <Textarea id="edit_observacoes" name="observacoes" rows={3} defaultValue={evento.observacoes ?? ""} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
