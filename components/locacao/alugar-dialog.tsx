"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Wallet, QrCode, CreditCard, Landmark, UserPlus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Switch } from "@/components/ui/switch";
import { ClienteCombobox } from "@/components/clientes/cliente-combobox";
import { cn } from "@/lib/utils";
import { criarAluguel } from "@/lib/locacao-actions";
import type { LocacaoFormaPagamento, LocacaoVeiculo } from "@/types";

const formasPagamento: { value: LocacaoFormaPagamento; label: string; icon: typeof Wallet }[] = [
  { value: "dinheiro", label: "Dinheiro", icon: Wallet },
  { value: "pix", label: "PIX", icon: QrCode },
  { value: "cartao", label: "Cartão", icon: CreditCard },
  { value: "transferencia", label: "Transf.", icon: Landmark },
];

function amanha() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function AlugarDialog({
  veiculo,
  clientes,
  open,
  onOpenChange,
}: {
  veiculo: LocacaoVeiculo;
  clientes: { id: string; nome: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [clienteId, setClienteId] = useState("");
  const [novoCliente, setNovoCliente] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState<LocacaoFormaPagamento>("pix");
  const [jaPago, setJaPago] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (!novoCliente && !clienteId) {
          toast.error("Selecione ou cadastre um cliente");
          return;
        }
        await criarAluguel({
          veiculoId: veiculo.id,
          clienteId: novoCliente ? null : clienteId,
          clienteNovo: novoCliente
            ? {
                nome: String(formData.get("cliente_nome") ?? ""),
                cpf: String(formData.get("cliente_cpf") ?? "") || null,
                telefone: String(formData.get("cliente_telefone") ?? "") || null,
              }
            : null,
          dataPrevistaDevolucao: new Date(String(formData.get("data_prevista") ?? amanha())).toISOString(),
          valor: parseFloat(String(formData.get("valor") ?? "0").replace(",", ".")) || 0,
          formaPagamento,
          statusPagamento: jaPago ? "pago" : "pendente",
          observacoes: String(formData.get("observacoes") ?? "") || null,
        });
        toast.success("Aluguel registrado");
        onOpenChange(false);
        setClienteId("");
        setNovoCliente(false);
        setJaPago(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao registrar aluguel");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alugar {veiculo.marca} {veiculo.modelo}</DialogTitle>
          <DialogDescription>Chassi {veiculo.chassi}</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label>Cliente</Label>
              <button
                type="button"
                onClick={() => setNovoCliente((v) => !v)}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <UserPlus className="size-3.5" />
                {novoCliente ? "Escolher existente" : "Novo cliente"}
              </button>
            </div>
            {novoCliente ? (
              <div className="flex flex-col gap-2 rounded-xl border border-border p-3">
                <Input name="cliente_nome" placeholder="Nome completo" required />
                <div className="grid grid-cols-2 gap-2">
                  <Input name="cliente_cpf" placeholder="CPF" />
                  <Input name="cliente_telefone" placeholder="Telefone" />
                </div>
              </div>
            ) : (
              <ClienteCombobox clientes={clientes} value={clienteId} onValueChange={setClienteId} placeholder="Selecione o cliente" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_prevista" className="mb-1.5 block">
                Devolução prevista
              </Label>
              <Input id="data_prevista" name="data_prevista" type="date" defaultValue={amanha()} required />
            </div>
            <div>
              <Label htmlFor="valor" className="mb-1.5 block">
                Valor (R$)
              </Label>
              <NumericInput id="valor" name="valor" defaultValue={veiculo.valor_diaria ?? undefined} required />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block">Forma de pagamento</Label>
            <div className="grid grid-cols-4 gap-2">
              {formasPagamento.map((fp) => {
                const Icon = fp.icon;
                const active = formaPagamento === fp.value;
                return (
                  <button
                    key={fp.value}
                    type="button"
                    onClick={() => setFormaPagamento(fp.value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border py-2.5 text-[11px] font-medium transition-colors",
                      active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    <Icon className="size-4" />
                    {fp.label}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
            <span className="text-sm text-foreground">Cliente já pagou</span>
            <Switch checked={jaPago} onCheckedChange={setJaPago} />
          </label>

          <div>
            <Label htmlFor="observacoes" className="mb-1.5 block">
              Observações
            </Label>
            <Input id="observacoes" name="observacoes" placeholder="Acessórios entregues, condição do veículo, etc." />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Registrando..." : "Registrar aluguel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
