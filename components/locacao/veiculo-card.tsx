"use client";

import { useState } from "react";
import { Bike, Scooter, CalendarClock, AlertTriangle, User, Wrench, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VeiculoDialog } from "@/components/locacao/veiculo-dialog";
import { AlugarDialog } from "@/components/locacao/alugar-dialog";
import { DevolverDialog } from "@/components/locacao/devolver-dialog";
import { updateVeiculoStatus } from "@/lib/locacao-actions";
import { cn } from "@/lib/utils";
import type { LocacaoVeiculo } from "@/types";

export interface AluguelAtivo {
  id: string;
  cliente_nome: string;
  data_retirada: string;
  data_prevista_devolucao: string;
  status_pagamento: string;
}

const STATUS_INFO: Record<string, { label: string; variant: "success" | "warning" | "secondary" | "info" }> = {
  disponivel: { label: "Disponível", variant: "success" },
  alugado: { label: "Alugado", variant: "info" },
  manutencao: { label: "Manutenção", variant: "warning" },
  inativo: { label: "Inativo", variant: "secondary" },
};

function diasRestantes(dataPrevista: string) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const prevista = new Date(dataPrevista);
  prevista.setHours(0, 0, 0, 0);
  return Math.round((prevista.getTime() - hoje.getTime()) / 86400000);
}

export function VeiculoCard({
  veiculo,
  aluguel,
  clientes,
}: {
  veiculo: LocacaoVeiculo;
  aluguel: AluguelAtivo | null;
  clientes: { id: string; nome: string }[];
}) {
  const [alugarOpen, setAlugarOpen] = useState(false);
  const [devolverOpen, setDevolverOpen] = useState(false);
  const Icon = veiculo.tipo === "bicicleta" ? Bike : Scooter;
  const status = STATUS_INFO[veiculo.status] ?? STATUS_INFO.disponivel;
  const dias = aluguel ? diasRestantes(aluguel.data_prevista_devolucao) : null;
  const atrasado = dias !== null && dias < 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm transition-colors",
        atrasado ? "border-destructive/40" : "border-border"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              veiculo.status === "alugado" ? "bg-info/10 text-info" : "bg-secondary text-muted-foreground"
            )}
          >
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {veiculo.marca} {veiculo.modelo}
            </p>
            <p className="text-xs text-muted-foreground">
              {veiculo.cor ? `${veiculo.cor} · ` : ""}
              {veiculo.chassi}
            </p>
          </div>
        </div>
        <VeiculoDialog veiculo={veiculo} />
      </div>

      <Badge variant={status.variant} className="w-fit">
        {status.label}
      </Badge>

      {aluguel ? (
        <div className="flex flex-col gap-1.5 rounded-xl bg-muted/60 p-3 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <User className="size-3.5 text-muted-foreground" />
            {aluguel.cliente_nome}
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5",
              atrasado ? "font-semibold text-destructive" : "text-muted-foreground"
            )}
          >
            {atrasado ? <AlertTriangle className="size-3.5" /> : <CalendarClock className="size-3.5" />}
            {atrasado
              ? `Atrasado há ${Math.abs(dias!)} dia${Math.abs(dias!) === 1 ? "" : "s"}`
              : dias === 0
                ? "Devolução hoje"
                : `${dias} dia${dias === 1 ? "" : "s"} para devolver`}
          </div>
          {aluguel.status_pagamento !== "pago" && (
            <Badge variant="warning" className="w-fit">
              Pagamento pendente
            </Badge>
          )}
        </div>
      ) : (
        veiculo.observacoes && <p className="text-xs text-muted-foreground">{veiculo.observacoes}</p>
      )}

      <div className="mt-auto flex gap-2 pt-1">
        {veiculo.status === "disponivel" && (
          <Button type="button" size="sm" className="flex-1 gap-1.5" onClick={() => setAlugarOpen(true)}>
            <PlayCircle className="size-3.5" />
            Alugar
          </Button>
        )}
        {veiculo.status === "alugado" && aluguel && (
          <Button type="button" size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => setDevolverOpen(true)}>
            Registrar devolução
          </Button>
        )}
        {veiculo.status === "manutencao" && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="flex-1 gap-1.5"
            onClick={() => updateVeiculoStatus(veiculo.id, "disponivel")}
          >
            <Wrench className="size-3.5" />
            Concluir manutenção
          </Button>
        )}
      </div>

      {veiculo.status === "disponivel" && (
        <AlugarDialog veiculo={veiculo} clientes={clientes} open={alugarOpen} onOpenChange={setAlugarOpen} />
      )}
      {aluguel && (
        <DevolverDialog aluguelId={aluguel.id} veiculoId={veiculo.id} open={devolverOpen} onOpenChange={setDevolverOpen} />
      )}
    </div>
  );
}
