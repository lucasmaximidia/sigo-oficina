"use client";

import { useState, useSyncExternalStore } from "react";
import { Bike, Scooter, PlayCircle, Wrench, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VeiculoDialog } from "@/components/locacao/veiculo-dialog";
import { AlugarDialog } from "@/components/locacao/alugar-dialog";
import { DevolverDialog } from "@/components/locacao/devolver-dialog";
import { RenovarAluguelDialog } from "@/components/locacao/renovar-aluguel-dialog";
import { updateVeiculoStatus } from "@/lib/locacao-actions";
import { corVeiculo } from "@/lib/locacao-cores";
import { cn, formatCurrency } from "@/lib/utils";
import type { LocacaoIcone, LocacaoVeiculo } from "@/types";

export interface AluguelAtivo {
  id: string;
  cliente_nome: string;
  cliente_telefone: string | null;
  data_retirada: string;
  data_prevista_devolucao: string;
  status_pagamento: string;
  km_inicio: number | null;
  valor: number;
  diarias_extras_atraso: number;
}

const STATUS_INFO: Record<string, { label: string; variant: "success" | "warning" | "secondary" | "info" }> = {
  disponivel: { label: "Disponível", variant: "success" },
  alugado: { label: "Alugado", variant: "info" },
  manutencao: { label: "Manutenção", variant: "warning" },
  inativo: { label: "Inativo", variant: "secondary" },
};

const formatarHora = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

// Duração curta ("8h", "2d") pra caber no rodapé do card.
function formatarDuracao(ms: number) {
  const horas = ms / 3_600_000;
  if (horas <= 0) return "0h";
  if (horas < 24) return `${Math.max(1, Math.round(horas))}h`;
  return `${Math.ceil(horas / 24)}d`;
}

interface EstadoCard {
  anelCor: string;
  anelPct: number;
  legenda: string;
  stats: { valor: string; rotulo: string; alerta?: boolean }[] | null;
}

// Estado "neutro", igual no servidor e no primeiro render do cliente — o
// anel depende da hora atual, que nunca é a mesma nos dois lados (o servidor
// renderiza num instante, a hidratação no cliente roda um pouco depois), e
// usar Date.now() direto aqui causaria erro de hidratação. Esse estado some
// assim que o efeito abaixo roda e marca a hora real.
const ESTADO_AGUARDANDO: EstadoCard = { anelCor: "var(--border)", anelPct: 100, legenda: " ", stats: null };

// useSyncExternalStore (mesmo padrão do NotificacoesBell) pra ler "agora" sem
// mismatch de hidratação. O valor fica em cache entre atualizações — pra não
// mudar a cada chamada do React dentro da mesma renderização — mas o cache é
// renovado a cada minuto via setInterval, avisando quem estiver inscrito.
// Sem isso, quem deixa a aba aberta (sem recarregar, já que a navegação do
// Next.js não recarrega a página) fica com o anel/contagem "congelados" no
// horário em que a página carregou, mesmo horas ou dias depois.
let agoraCache = Date.now();
const ouvintesRelogio = new Set<() => void>();
let intervaloRelogio: ReturnType<typeof setInterval> | null = null;

function inscreverRelogio(ouvinte: () => void) {
  ouvintesRelogio.add(ouvinte);
  if (!intervaloRelogio) {
    intervaloRelogio = setInterval(() => {
      agoraCache = Date.now();
      ouvintesRelogio.forEach((cb) => cb());
    }, 60_000);
  }
  return () => {
    ouvintesRelogio.delete(ouvinte);
    if (ouvintesRelogio.size === 0 && intervaloRelogio) {
      clearInterval(intervaloRelogio);
      intervaloRelogio = null;
    }
  };
}
function agoraCliente(): number {
  return agoraCache;
}
function agoraServidor(): number | null {
  return null;
}

function calcularEstado(
  veiculo: LocacaoVeiculo,
  aluguel: AluguelAtivo | null,
  agora: number | null,
  kmAtual?: number | null
): EstadoCard {
  if (agora == null) return ESTADO_AGUARDANDO;
  if (!aluguel) {
    if (veiculo.status === "manutencao") {
      return { anelCor: "var(--warning)", anelPct: 100, legenda: "Em manutenção", stats: null };
    }
    if (veiculo.status === "inativo") {
      return { anelCor: "var(--muted-foreground)", anelPct: 100, legenda: "Inativo", stats: null };
    }
    return {
      anelCor: "var(--success)",
      anelPct: 100,
      legenda: "Pronta pra alugar",
      stats: [
        { valor: kmAtual != null ? `${kmAtual} km` : "—", rotulo: "Rodados" },
        { valor: veiculo.valor_diaria != null ? formatCurrency(veiculo.valor_diaria) : "—", rotulo: "Diária" },
      ],
    };
  }

  const prevista = new Date(aluguel.data_prevista_devolucao).getTime();
  const atrasado = prevista < agora;

  if (atrasado) {
    const hojeCal = new Date(agora);
    hojeCal.setHours(0, 0, 0, 0);
    const prevCal = new Date(aluguel.data_prevista_devolucao);
    prevCal.setHours(0, 0, 0, 0);
    const dias = Math.round((prevCal.getTime() - hojeCal.getTime()) / 86_400_000);
    const diasAtraso = Math.abs(dias);
    return {
      anelCor: "var(--destructive)",
      anelPct: 100,
      legenda: dias < 0 ? `Atrasado há ${diasAtraso} dia${diasAtraso === 1 ? "" : "s"}` : `Atrasado desde ${formatarHora(aluguel.data_prevista_devolucao)}`,
      stats: [
        { valor: dias < 0 ? `${diasAtraso}d` : "Hoje", rotulo: "Atraso", alerta: true },
        { valor: formatCurrency(aluguel.valor), rotulo: "Valor" },
      ],
    };
  }

  const inicio = new Date(aluguel.data_retirada).getTime();
  const total = prevista - inicio;
  const restanteMs = prevista - agora;
  const pct = total > 0 ? Math.max(0, Math.min(100, (restanteMs / total) * 100)) : 0;

  return {
    anelCor: pct < 25 ? "var(--warning)" : "var(--success)",
    anelPct: pct,
    legenda: `Faltam ${formatarDuracao(restanteMs)} pra devolver`,
    stats: [
      { valor: formatarDuracao(restanteMs), rotulo: "Restantes" },
      { valor: formatCurrency(aluguel.valor), rotulo: "Valor" },
    ],
  };
}

export function VeiculoCard({
  veiculo,
  aluguel,
  clientes,
  kmAtual,
  icones,
}: {
  veiculo: LocacaoVeiculo;
  aluguel: AluguelAtivo | null;
  clientes: { id: string; nome: string; telefone: string | null }[];
  kmAtual?: number | null;
  icones: LocacaoIcone[];
}) {
  const [alugarOpen, setAlugarOpen] = useState(false);
  const [devolverOpen, setDevolverOpen] = useState(false);
  const [renovarOpen, setRenovarOpen] = useState(false);
  const [iconeComErro, setIconeComErro] = useState(false);
  const agora = useSyncExternalStore(inscreverRelogio, agoraCliente, agoraServidor);
  const Icon = veiculo.tipo === "bicicleta" ? Bike : Scooter;
  const mostrarIcone = !!veiculo.foto_url && !iconeComErro;
  const status = STATUS_INFO[veiculo.status] ?? STATUS_INFO.disponivel;
  const cor = corVeiculo(veiculo.cor);
  const estado = calcularEstado(veiculo, aluguel, agora, kmAtual);
  const atrasado = estado.anelCor === "var(--destructive)";

  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-2.5 rounded-2xl border bg-card p-4 text-center shadow-sm transition-colors",
        atrasado ? "border-destructive/40" : "border-border"
      )}
    >
      <div className="absolute right-2.5 top-2.5">
        <VeiculoDialog veiculo={veiculo} icones={icones} />
      </div>

      <div
        className="mt-1 size-24 shrink-0 rounded-full p-[5px] transition-[background]"
        style={{ background: `conic-gradient(${estado.anelCor} ${estado.anelPct}%, var(--border) 0)` }}
      >
        <div
          className="flex size-full items-center justify-center overflow-hidden rounded-full bg-card"
          style={!mostrarIcone && cor ? { backgroundColor: cor.bg, color: cor.fg } : undefined}
        >
          {mostrarIcone ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={veiculo.foto_url!}
              alt={`${veiculo.marca} ${veiculo.modelo}`}
              className="size-[78%] object-contain"
              onError={() => setIconeComErro(true)}
            />
          ) : (
            <Icon className="size-8" strokeWidth={1.75} />
          )}
        </div>
      </div>
      <span className="text-[11px] font-bold" style={{ color: estado.anelCor }}>
        {estado.legenda}
      </span>

      <div>
        <p className="text-sm font-semibold text-foreground">
          {veiculo.marca} {veiculo.modelo}
        </p>
        <p className="text-xs text-muted-foreground">
          {veiculo.cor ? `${veiculo.cor} · ` : ""}
          {veiculo.chassi}
        </p>
      </div>

      {aluguel && (
        <p className="text-xs text-muted-foreground">
          Com <span className="font-medium text-foreground">{aluguel.cliente_nome}</span>
        </p>
      )}
      {!aluguel && veiculo.observacoes && <p className="text-xs text-muted-foreground">{veiculo.observacoes}</p>}

      <div className="flex flex-wrap justify-center gap-1.5">
        <Badge variant={status.variant}>{status.label}</Badge>
        {aluguel && aluguel.status_pagamento !== "pago" && <Badge variant="warning">Pagamento pendente</Badge>}
        {aluguel && aluguel.diarias_extras_atraso > 0 && (
          <Badge variant="destructive">
            +{aluguel.diarias_extras_atraso} diária{aluguel.diarias_extras_atraso === 1 ? "" : "s"} (atraso)
          </Badge>
        )}
      </div>

      {estado.stats && (
        <div className="mt-0.5 grid w-full grid-cols-2 divide-x divide-border border-t border-border pt-2.5">
          {estado.stats.map((s) => (
            <div key={s.rotulo} className="flex flex-col items-center gap-0.5">
              <span className={cn("font-display text-sm font-bold tabular-nums", s.alerta && "text-destructive")}>
                {s.valor}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.rotulo}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto flex w-full gap-2 pt-1">
        {veiculo.status === "disponivel" && (
          <Button type="button" size="sm" className="flex-1 gap-1.5" onClick={() => setAlugarOpen(true)}>
            <PlayCircle className="size-3.5" />
            Alugar
          </Button>
        )}
        {veiculo.status === "alugado" && aluguel && (
          <>
            <Button type="button" size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => setRenovarOpen(true)}>
              <Send className="size-3.5" />
              Renovar
            </Button>
            <Button type="button" size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => setDevolverOpen(true)}>
              Devolver
            </Button>
          </>
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
      {aluguel && (
        <RenovarAluguelDialog
          aluguelId={aluguel.id}
          clienteNome={aluguel.cliente_nome}
          clienteTelefone={aluguel.cliente_telefone}
          valorDiaria={veiculo.valor_diaria}
          open={renovarOpen}
          onOpenChange={setRenovarOpen}
        />
      )}
    </div>
  );
}
