"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Wallet, QrCode, CreditCard, Landmark, UserPlus, Printer, Send, CheckCircle2 } from "lucide-react";
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

// Formata em horário local (não UTC) no formato que <input type="datetime-local">
// espera — new Date(valorDoInput) depois interpreta de volta como horário local.
function paraDatetimeLocal(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function agora() {
  return paraDatetimeLocal(new Date());
}

function amanhaAsDezoitoHoras() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(18, 0, 0, 0);
  return paraDatetimeLocal(d);
}

// Soma dias (em horas de 24h, mesmo critério usado na extensão automática
// por atraso em lib/locacao-atraso.ts) a um valor de <input type="datetime-local">.
function somarDias(dataLocal: string, dias: number) {
  const data = new Date(dataLocal);
  if (Number.isNaN(data.getTime())) return dataLocal;
  return paraDatetimeLocal(new Date(data.getTime() + dias * 24 * 3_600_000));
}

export function AlugarDialog({
  veiculo,
  clientes,
  kmAtual,
  open,
  onOpenChange,
}: {
  veiculo: LocacaoVeiculo;
  clientes: { id: string; nome: string; telefone: string | null }[];
  kmAtual?: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [clienteId, setClienteId] = useState("");
  const [novoCliente, setNovoCliente] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState<LocacaoFormaPagamento>("pix");
  const [jaPago, setJaPago] = useState(false);

  // Dias de locação: ao mudar a retirada ou a quantidade de dias, recalcula
  // a devolução prevista (retirada + N dias de 24h) e o valor (N × diária do
  // veículo) — mas sem travar os campos: a oficina ainda pode ajustar a
  // devolução ou o valor manualmente depois, pra casos fora do padrão.
  const [dataRetirada, setDataRetirada] = useState(agora());
  const [dias, setDias] = useState(1);
  const [dataPrevista, setDataPrevista] = useState(() => somarDias(agora(), 1));
  const [valor, setValor] = useState(veiculo.valor_diaria ?? 0);

  function atualizarRetirada(novaRetirada: string) {
    setDataRetirada(novaRetirada);
    setDataPrevista(somarDias(novaRetirada, dias));
  }

  function atualizarDias(novosDias: number) {
    setDias(novosDias);
    setDataPrevista(somarDias(dataRetirada, novosDias));
    if (veiculo.valor_diaria) setValor(novosDias * veiculo.valor_diaria);
  }
  const [isPending, startTransition] = useTransition();
  const [criado, setCriado] = useState<{ aluguelId: string; clienteNome: string; clienteTelefone: string | null } | null>(
    null
  );

  function fecharTudo(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setClienteId("");
      setNovoCliente(false);
      setJaPago(false);
      setCriado(null);
      setDataRetirada(agora());
      setDias(1);
      setDataPrevista(somarDias(agora(), 1));
      setValor(veiculo.valor_diaria ?? 0);
    }
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (!novoCliente && !clienteId) {
          toast.error("Selecione ou cadastre um cliente");
          return;
        }
        const clienteNomeNovo = String(formData.get("cliente_nome") ?? "");
        const clienteTelefoneNovo = String(formData.get("cliente_telefone") ?? "") || null;
        const clienteExistente = clientes.find((c) => c.id === clienteId);

        const { id: aluguelId } = await criarAluguel({
          veiculoId: veiculo.id,
          clienteId: novoCliente ? null : clienteId,
          clienteNovo: novoCliente
            ? {
                nome: clienteNomeNovo,
                cpf: String(formData.get("cliente_cpf") ?? "") || null,
                telefone: clienteTelefoneNovo,
              }
            : null,
          dataRetirada: new Date(String(formData.get("data_retirada") ?? agora())).toISOString(),
          dataPrevistaDevolucao: new Date(String(formData.get("data_prevista") ?? amanhaAsDezoitoHoras())).toISOString(),
          valor: parseFloat(String(formData.get("valor") ?? "0").replace(",", ".")) || 0,
          formaPagamento,
          statusPagamento: jaPago ? "pago" : "pendente",
          kmInicio: formData.get("km_inicio") ? parseInt(String(formData.get("km_inicio")), 10) : null,
          observacoes: String(formData.get("observacoes") ?? "") || null,
        });
        toast.success("Aluguel registrado");
        setCriado({
          aluguelId,
          clienteNome: novoCliente ? clienteNomeNovo : clienteExistente?.nome ?? "Cliente",
          clienteTelefone: novoCliente ? clienteTelefoneNovo : clienteExistente?.telefone ?? null,
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao registrar aluguel");
      }
    });
  }

  function enviarContratoOnline() {
    if (!criado) return;
    const link = `${window.location.origin}/locacao/contrato/${criado.aluguelId}`;
    const telefone = criado.clienteTelefone?.replace(/\D/g, "");
    const mensagem = encodeURIComponent(
      `Olá ${criado.clienteNome}!\nAqui está o contrato da sua locação na VoltCity.\nDá uma lida e se concordar, clique em "Aceitar contrato", preencha com seu nome e telefone para confirmar.\n\n${link}`
    );
    const url = telefone ? `https://wa.me/55${telefone}?text=${mensagem}` : `https://wa.me/?text=${mensagem}`;
    window.open(url, "_blank");
  }

  if (criado) {
    return (
      <Dialog open={open} onOpenChange={fecharTudo}>
        <DialogContent className="locacao-theme">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-success" />
              Aluguel registrado
            </DialogTitle>
            <DialogDescription>Escolha como formalizar o contrato com {criado.clienteNome}.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              className="justify-start gap-2"
              onClick={() => window.open(`/api/locacao/${criado.aluguelId}/contrato`, "_blank")}
            >
              <Printer className="size-4" />
              Imprimir contrato
            </Button>
            <Button type="button" className="justify-start gap-2" onClick={enviarContratoOnline}>
              <Send className="size-4" />
              Enviar link online (WhatsApp)
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            No link online, o cliente lê o contrato, confirma o nome e aceita — e já vê se o pagamento está pendente ou
            confirmado.
          </p>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => fecharTudo(false)}>
              Concluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={fecharTudo}>
      <DialogContent className="locacao-theme">
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
              <Label htmlFor="data_retirada" className="mb-1.5 block">
                Retirada
              </Label>
              <Input
                id="data_retirada"
                name="data_retirada"
                type="datetime-local"
                value={dataRetirada}
                onChange={(e) => atualizarRetirada(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="dias" className="mb-1.5 block">
                Dias de locação
              </Label>
              <Input
                id="dias"
                type="number"
                inputMode="numeric"
                min={1}
                value={dias}
                onChange={(e) => atualizarDias(Math.max(1, parseInt(e.target.value, 10) || 1))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_prevista" className="mb-1.5 block">
                Devolução prevista
              </Label>
              <Input
                id="data_prevista"
                name="data_prevista"
                type="datetime-local"
                value={dataPrevista}
                onChange={(e) => setDataPrevista(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="valor" className="mb-1.5 block">
                Valor (R$)
              </Label>
              <NumericInput id="valor" name="valor" value={valor} onValueChange={setValor} required />
            </div>
          </div>
          <p className="-mt-2 text-xs text-muted-foreground">
            Devolução e valor são calculados pelos dias de locação — ajuste se precisar de algo fora do padrão.
          </p>

          <div>
            <Label htmlFor="km_inicio" className="mb-1.5 block">
              KM inicial (opcional)
            </Label>
            <Input
              id="km_inicio"
              name="km_inicio"
              type="number"
              inputMode="numeric"
              placeholder={kmAtual != null ? `Atual: ${kmAtual} km` : "Ex: 1200"}
              defaultValue={kmAtual ?? undefined}
            />
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
