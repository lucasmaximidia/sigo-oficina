"use client";

import { useState } from "react";
import { Bike, Scooter, CalendarClock, AlertTriangle, User, Wrench, PlayCircle, Zap, Gauge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VeiculoDialog } from "@/components/locacao/veiculo-dialog";
import { AlugarDialog } from "@/components/locacao/alugar-dialog";
import { DevolverDialog } from "@/components/locacao/devolver-dialog";
import { updateVeiculoStatus } from "@/lib/locacao-actions";
import { corVeiculo } from "@/lib/locacao-cores";
import { cn } from "@/lib/utils";
import type { LocacaoVeiculo } from "@/types";

export interface AluguelAtivo {
  id: string;
  cliente_nome: string;
  data_retirada: string;
  data_prevista_devolucao: string;
  status_pagamento: string;
  km_inicio: number | null;
}

const STATUS_INFO: Record<string, { label: string; variant: "success" | "warning" | "secondary" | "info" }> = {
  disponivel: { label: "Disponível", variant: "success" },
  alugado: { label: "Alugado", variant: "info" },
  manutencao: { label: "Manutenção", variant: "warning" },
  inativo: { label: "Inativo", variant: "secondary" },
};

const formatarHora = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

function statusDevolucao(dataPrevista: string) {
  const agora = new Date();
  const prevista = new Date(dataPrevista);
  const atrasado = prevista.getTime() < agora.getTime();

  const hojeCal = new Date();
  hojeCal.setHours(0, 0, 0, 0);
  const prevCal = new Date(dataPrevista);
  prevCal.setHours(0, 0, 0, 0);
  const dias = Math.round((prevCal.getTime() - hojeCal.getTime()) / 86400000);

  return { atrasado, dias, hora: formatarHora(dataPrevista) };
}

export function VeiculoCard({
  veiculo,
  aluguel,
  clientes,
  kmAtual,
}: {
  veiculo: LocacaoVeiculo;
  aluguel: AluguelAtivo | null;
  clientes: { id: string; nome: string }[];
  kmAtual?: number | null;
}) {
  const [alugarOpen, setAlugarOpen] = useState(false);
  const [devolverOpen, setDevolverOpen] = useState(false);
  const Icon = veiculo.tipo === "bicicleta" ? Bike : Scooter;
  const status = STATUS_INFO[veiculo.status] ?? STATUS_INFO.disponivel;
  const cor = corVeiculo(veiculo.cor);
  const devolucao = aluguel ? statusDevolucao(aluguel.data_prevista_devolucao) : null;
  const atrasado = devolucao?.atrasado ?? false;

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
              "relative flex size-13 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-sm",
              !cor && !veiculo.foto_url && "bg-gradient-to-br from-primary to-primary-hover text-primary-foreground",
              veiculo.foto_url && "bg-muted",
              veiculo.status === "alugado" && "ring-2 ring-info/50 ring-offset-2 ring-offset-card"
            )}
            style={!veiculo.foto_url && cor ? { backgroundColor: cor.bg, color: cor.fg } : undefined}
          >
            {veiculo.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={veiculo.foto_url}
                alt={`${veiculo.marca} ${veiculo.modelo}`}
                className="size-full object-cover"
              />
            ) : (
              <Icon className="size-6" strokeWidth={1.75} />
            )}
            <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-locacao-spark text-locacao-spark-foreground shadow-sm ring-2 ring-card">
              <Zap className="size-3" strokeWidth={2.5} fill="currentColor" />
            </span>
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
              ? devolucao!.dias < 0
                ? `Atrasado há ${Math.abs(devolucao!.dias)} dia${Math.abs(devolucao!.dias) === 1 ? "" : "s"}`
                : `Atrasado desde ${devolucao!.hora}`
              : devolucao!.dias === 0
                ? `Devolução hoje às ${devolucao!.hora}`
                : `${devolucao!.dias} dia${devolucao!.dias === 1 ? "" : "s"} para devolver (${devolucao!.hora})`}
          </div>
          {aluguel.status_pagamento !== "pago" && (
            <Badge variant="warning" className="w-fit">
              Pagamento pendente
            </Badge>
          )}
          {aluguel.km_inicio != null && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Gauge className="size-3.5" />
              Saiu com {aluguel.km_inicio} km
            </div>
          )}
        </div>
      ) : (
        <>
          {veiculo.observacoes && <p className="text-xs text-muted-foreground">{veiculo.observacoes}</p>}
          {kmAtual != null && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Gauge className="size-3.5" />
              {kmAtual} km rodados
            </div>
          )}
        </>
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
        <AlugarDialog
          veiculo={veiculo}
          clientes={clientes}
          kmAtual={kmAtual}
          open={alugarOpen}
          onOpenChange={setAlugarOpen}
        />
      )}
      {aluguel && (
        <DevolverDialog
          aluguelId={aluguel.id}
          veiculoId={veiculo.id}
          kmInicio={aluguel.km_inicio}
          open={devolverOpen}
          onOpenChange={setDevolverOpen}
        />
      )}
    </div>
  );
}
