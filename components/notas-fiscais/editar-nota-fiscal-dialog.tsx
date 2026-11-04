"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { editarNotaFiscalAction } from "@/lib/notas-fiscais-actions";
import type { NotaFiscal } from "@/types";

export function EditarNotaFiscalDialog({ nota }: { nota: NotaFiscal }) {
  const [open, setOpen] = useState(false);
  const [descricao, setDescricao] = useState(nota.descricao_servico);
  const [observacoes, setObservacoes] = useState(nota.observacoes ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!descricao.trim()) {
      toast.error("Informe a descrição do serviço");
      return;
    }
    startTransition(async () => {
      try {
        await editarNotaFiscalAction(nota.id, { descricaoServico: descricao, observacoes: observacoes || null });
        toast.success("Nota fiscal atualizada");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao atualizar nota fiscal");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) {
          setDescricao(nota.descricao_servico);
          setObservacoes(nota.observacoes ?? "");
        }
      }}
    >
      <button
        type="button"
        aria-label="Editar nota fiscal"
        onClick={() => setOpen(true)}
        className="-m-2 shrink-0 rounded-md p-2 text-muted-foreground hover:text-foreground"
      >
        <Pencil className="size-4" />
      </button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar nota fiscal</DialogTitle>
          <DialogDescription>
            Vale só pra essa nota — o texto padrão em Configurações continua sendo usado nas outras.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="descricao_servico" className="mb-1.5 block">
              Descrição do serviço
            </Label>
            <Textarea
              id="descricao_servico"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="observacoes" className="mb-1.5 block">
              Observações (opcional)
            </Label>
            <Textarea
              id="observacoes"
              placeholder="Aparece na nota como informações complementares."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
