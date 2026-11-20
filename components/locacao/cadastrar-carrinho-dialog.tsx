"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Copy, CheckCircle2 } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { cadastrarCarrinho } from "@/lib/locacao-dispositivos-actions";
import type { LocacaoVeiculo } from "@/types";

export function CadastrarCarrinhoDialog({ veiculos }: { veiculos: Pick<LocacaoVeiculo, "id" | "marca" | "modelo">[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [resultado, setResultado] = useState<{ numeroCarrinho: number; deviceToken: string } | null>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setResultado(null);
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const r = await cadastrarCarrinho(formData);
        setResultado(r);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao cadastrar carrinho");
      }
    });
  }

  function copiarToken() {
    if (!resultado) return;
    navigator.clipboard.writeText(resultado.deviceToken);
    toast.success("Token copiado");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="size-4" />
          Cadastrar carrinho
        </Button>
      </DialogTrigger>
      <DialogContent className="locacao-theme">
        <DialogHeader>
          <DialogTitle>Cadastrar carrinho</DialogTitle>
          <DialogDescription>
            {resultado
              ? "Digite esse token na configuração do ESP32."
              : "Gera o token (device_token) que o ESP32 vai usar pra se identificar."}
          </DialogDescription>
        </DialogHeader>

        {!resultado ? (
          <form action={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="numero_carrinho" className="mb-1.5 block">
                Número do carrinho
              </Label>
              <NumericInput id="numero_carrinho" name="numero_carrinho" decimal={false} required />
            </div>
            <div>
              <Label className="mb-1.5 block">Veículo (opcional)</Label>
              <Select name="veiculo_id" defaultValue="nenhum">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="locacao-theme">
                  <SelectItem value="nenhum">Sem veículo ligado</SelectItem>
                  {veiculos.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.marca} {v.modelo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                Cadastrar
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-3">
              <div className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                <p>
                  Carrinho <span className="font-medium">#{resultado.numeroCarrinho}</span> cadastrado.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-md border border-border bg-card px-2 py-1.5 text-xs text-muted-foreground">
                  {resultado.deviceToken}
                </code>
                <Button type="button" variant="outline" size="icon" onClick={copiarToken} title="Copiar token">
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => handleOpenChange(false)}>
                Concluir
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
