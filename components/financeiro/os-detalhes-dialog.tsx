"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOsDetalhes, type OsDetalhes } from "@/lib/actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { formaPagamentoLabel } from "@/lib/relatorio-financeiro";
import { osStatusMap } from "@/lib/status";

export function OsDetalhesDialog({ osId, label }: { osId: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [detalhes, setDetalhes] = useState<OsDetalhes | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(novoOpen: boolean) {
    setOpen(novoOpen);
    if (novoOpen && !detalhes) {
      startTransition(async () => {
        try {
          setDetalhes(await getOsDetalhes(osId));
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Erro ao carregar a OS");
          setOpen(false);
        }
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <button type="button" onClick={() => handleOpenChange(true)} className="font-medium text-primary hover:underline">
        {label}
      </button>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>
        {isPending || !detalhes ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Carregando...
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-2 text-sm">
              <div>
                <p className="text-foreground">{detalhes.cliente}</p>
                <p className="text-muted-foreground">{detalhes.equipamentoDescricao}</p>
                <p className="text-muted-foreground">{formatDate(detalhes.data)}</p>
              </div>
              <Badge variant={osStatusMap[detalhes.status].variant}>{osStatusMap[detalhes.status].label}</Badge>
            </div>

            <div className="rounded-lg border border-border p-3 text-sm">
              <p className="text-xs text-muted-foreground">Defeito relatado</p>
              <p className="mt-1 text-foreground">{detalhes.problemaRelatado}</p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Qtd.</TableHead>
                  <TableHead>Valor Unit.</TableHead>
                  <TableHead>Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detalhes.itens.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-foreground">{item.descricao}</TableCell>
                    <TableCell className="text-muted-foreground">{item.quantidade}</TableCell>
                    <TableCell className="text-muted-foreground">{formatCurrency(item.valorUnitario)}</TableCell>
                    <TableCell className="text-foreground">
                      {formatCurrency(item.quantidade * item.valorUnitario)}
                    </TableCell>
                  </TableRow>
                ))}
                {detalhes.itens.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                      Nenhuma peça lançada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex flex-col items-end gap-1 text-sm">
              <p className="text-muted-foreground">Mão de obra: {formatCurrency(detalhes.valorMaoObra)}</p>
              {detalhes.valorFrete > 0 && (
                <p className="text-muted-foreground">Frete: {formatCurrency(detalhes.valorFrete)}</p>
              )}
              {detalhes.desconto > 0 && (
                <p className="text-muted-foreground">Desconto: -{formatCurrency(detalhes.desconto)}</p>
              )}
              <p className="text-base font-semibold text-foreground">Total: {formatCurrency(detalhes.total)}</p>
              {detalhes.formaPagamento && (
                <p className="text-muted-foreground">
                  {formaPagamentoLabel[detalhes.formaPagamento] ?? detalhes.formaPagamento}
                </p>
              )}
            </div>

            <Button asChild variant="outline" className="w-full">
              <Link href={`/ordens-servico/${osId}`}>
                Ver OS completa
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
