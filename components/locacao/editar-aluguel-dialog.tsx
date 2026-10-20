"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Wallet, QrCode, CreditCard, Landmark, Pencil } from "lucide-react";
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
import { atualizarAluguel } from "@/lib/locacao-actions";
import type { LocacaoAluguel, LocacaoFormaPagamento } from "@/types";

const formasPagamento: { value: LocacaoFormaPagamento; label: string; icon: typeof Wallet }[] = [
  { value: "dinheiro", label: "Dinheiro", icon: Wallet },
  { value: "pix", label: "PIX", icon: QrCode },
  { value: "cartao", label: "Cartão", icon: CreditCard },
  { value: "transferencia", label: "Transf.", icon: Landmark },
];

function paraDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EditarAluguelDialog({
  aluguel,
  veiculos,
  clientes,
}: {
  aluguel: LocacaoAluguel;
  veiculos: { id: string; marca: string; modelo: string; chassi: string }[];
  clientes: { id: string; nome: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [veiculoId, setVeiculoId] = useState(aluguel.veiculo_id);
  const [clienteId, setClienteId] = useState(aluguel.cliente_id);
  const [formaPagamento, setFormaPagamento] = useState<LocacaoFormaPagamento>(aluguel.forma_pagamento);
  const [pago, setPago] = useState(aluguel.status_pagamento === "pago");
  const [isPending, startTransition] = useTransition();

  const veiculosOpcoes = veiculos.map((v) => ({ id: v.id, nome: `${v.marca} ${v.modelo} · ${v.chassi}` }));

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const valor = parseFloat(String(formData.get("valor") ?? "0").replace(",", ".")) || 0;
        const valorPago = parseFloat(String(formData.get("valor_pago") ?? "0").replace(",", ".")) || 0;
        await atualizarAluguel(aluguel.id, {
          veiculoId,
          clienteId,
          dataRetirada: new Date(String(formData.get("data_retirada"))).toISOString(),
          dataPrevistaDevolucao: new Date(String(formData.get("data_prevista"))).toISOString(),
          valor,
          formaPagamento,
          statusPagamento: pago ? "pago" : "pendente",
          valorPago,
          dataPagamento: pago ? (String(formData.get("data_pagamento") ?? "") || new Date().toISOString().slice(0, 10)) : null,
          kmInicio: formData.get("km_inicio") ? parseInt(String(formData.get("km_inicio")), 10) : null,
          kmFim: formData.get("km_fim") ? parseInt(String(formData.get("km_fim")), 10) : null,
          observacoes: String(formData.get("observacoes") ?? "") || null,
        });
        toast.success("Aluguel atualizado");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao atualizar aluguel");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        aria-label="Editar aluguel"
        onClick={() => setOpen(true)}
        className="-m-2 shrink-0 rounded-md p-2 text-muted-foreground hover:text-foreground"
      >
        <Pencil className="size-4" />
      </button>
      <DialogContent className="locacao-theme">
        <DialogHeader>
          <DialogTitle>Editar aluguel #{String(aluguel.numero).padStart(4, "0")}</DialogTitle>
          <DialogDescription>Corrija dados lançados incorretamente.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto pr-1">
          <div>
            <Label className="mb-1.5 block">Cliente</Label>
            <ClienteCombobox clientes={clientes} value={clienteId} onValueChange={setClienteId} placeholder="Selecione o cliente" />
          </div>

          <div>
            <Label className="mb-1.5 block">Veículo</Label>
            <ClienteCombobox clientes={veiculosOpcoes} value={veiculoId} onValueChange={setVeiculoId} placeholder="Selecione o veículo" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_retirada" className="mb-1.5 block">
                Retirada
              </Label>
              <Input
                id="data_retirada"
                name="data_retirada"
                type="datetime-local"
                defaultValue={paraDatetimeLocal(aluguel.data_retirada)}
                required
              />
            </div>
            <div>
              <Label htmlFor="data_prevista" className="mb-1.5 block">
                Devolução prevista
              </Label>
              <Input
                id="data_prevista"
                name="data_prevista"
                type="datetime-local"
                defaultValue={paraDatetimeLocal(aluguel.data_prevista_devolucao)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="km_inicio" className="mb-1.5 block">
                KM inicial
              </Label>
              <Input
                id="km_inicio"
                name="km_inicio"
                type="number"
                inputMode="numeric"
                defaultValue={aluguel.km_inicio ?? undefined}
              />
            </div>
            <div>
              <Label htmlFor="km_fim" className="mb-1.5 block">
                KM final
              </Label>
              <Input id="km_fim" name="km_fim" type="number" inputMode="numeric" defaultValue={aluguel.km_fim ?? undefined} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valor" className="mb-1.5 block">
                Valor (R$)
              </Label>
              <NumericInput id="valor" name="valor" defaultValue={aluguel.valor} required />
            </div>
            <div>
              <Label htmlFor="valor_pago" className="mb-1.5 block">
                Valor pago (R$)
              </Label>
              <NumericInput id="valor_pago" name="valor_pago" defaultValue={aluguel.valor_pago} />
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
            <Switch checked={pago} onCheckedChange={setPago} />
          </label>

          {pago && (
            <div>
              <Label htmlFor="data_pagamento" className="mb-1.5 block">
                Data do pagamento
              </Label>
              <Input
                id="data_pagamento"
                name="data_pagamento"
                type="date"
                defaultValue={aluguel.data_pagamento ?? new Date().toISOString().slice(0, 10)}
              />
            </div>
          )}

          <div>
            <Label htmlFor="observacoes" className="mb-1.5 block">
              Observações
            </Label>
            <Input id="observacoes" name="observacoes" defaultValue={aluguel.observacoes ?? ""} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
