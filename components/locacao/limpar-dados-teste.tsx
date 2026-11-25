"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { limparDadosTesteCarrinhos } from "@/lib/locacao-dispositivos-actions";

const PALAVRA_CONFIRMACAO = "LIMPAR";

export function LimparDadosTeste() {
  const [open, setOpen] = useState(false);
  const [confirmacao, setConfirmacao] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setConfirmacao("");
  }

  function limpar() {
    startTransition(async () => {
      try {
        await limparDadosTesteCarrinhos();
        toast.success("Dados de teste apagados");
        handleOpenChange(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao apagar dados de teste");
      }
    });
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle>Dados de teste</CardTitle>
        <CardDescription>
          Apaga todo o histórico de aluguéis de todos os carrinhos (Histórico, Resumo e Faturamento), junto com as
          entradas de caixa e despesas (diária/saída) geradas a partir deles.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button type="button" variant="destructive">
              <Trash2 className="size-4" />
              Limpar dados de teste
            </Button>
          </DialogTrigger>
          <DialogContent className="locacao-theme">
            <DialogHeader>
              <DialogTitle>Limpar dados de teste de todos os carrinhos</DialogTitle>
              <DialogDescription>Essa ação não pode ser desfeita.</DialogDescription>
            </DialogHeader>
            <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-foreground">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
              <p>
                Apaga TODOS os aluguéis registrados (lançados no caixa ou não) e os lançamentos de caixa e despesas
                (diária/saída) dos carrinhos. O cadastro dos carrinhos (número, token, bateria) não é afetado.
              </p>
            </div>
            <div>
              <Label htmlFor="confirmacao_limpar" className="mb-1.5 block">
                Digite <span className="font-semibold">{PALAVRA_CONFIRMACAO}</span> para confirmar
              </Label>
              <Input id="confirmacao_limpar" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="destructive"
                disabled={isPending || confirmacao !== PALAVRA_CONFIRMACAO}
                onClick={limpar}
              >
                Limpar dados de teste
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
