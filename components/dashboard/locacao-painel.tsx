import Link from "next/link";
import { Bike, Scooter, User, CalendarClock, AlertTriangle, Zap, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { corVeiculo } from "@/lib/locacao-cores";
import { cn } from "@/lib/utils";

export interface AluguelPainel {
  id: string;
  veiculoTipo: "scooter" | "bicicleta";
  veiculoMarca: string;
  veiculoModelo: string;
  veiculoCor: string | null;
  clienteNome: string;
  dataPrevistaDevolucao: string;
  statusPagamento: string;
}

const formatarHora = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }).format(new Date(iso));

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

// Painel de destaque da Locação (VoltCity) no dashboard da oficina — cores
// fixas da própria marca (verde + preto), de propósito diferentes do resto
// do dashboard, pra funcionar como um cartão de identidade visual único:
// equipamento + cliente juntos, reconhecíveis de relance.
export function LocacaoPainel({ alugueis }: { alugueis: AluguelPainel[] }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-[#0b120d] p-5 text-white shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#16a34a]">
            <Zap className="size-4.5 fill-current text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-display text-base font-bold leading-tight">Locação</p>
            <p className="text-[11px] font-medium text-white/50">VoltCity · aluguéis em vigência</p>
          </div>
        </div>
        <Link
          href="/locacao"
          className="flex items-center gap-1 text-xs font-medium text-[#4ade80] hover:text-[#86efac]"
        >
          Ver tudo
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {alugueis.length === 0 ? (
        <p className="rounded-xl bg-white/5 px-4 py-6 text-center text-sm text-white/60">
          Nenhum veículo alugado no momento.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {alugueis.map((a) => {
            const Icon = a.veiculoTipo === "bicicleta" ? Bike : Scooter;
            const cor = corVeiculo(a.veiculoCor);
            const { atrasado, dias, hora } = statusDevolucao(a.dataPrevistaDevolucao);
            return (
              <div key={a.id} className="flex items-center gap-3 rounded-xl bg-white/[0.06] p-3">
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    !cor && "bg-[#16a34a]"
                  )}
                  style={cor ? { backgroundColor: cor.bg, color: cor.fg } : { color: "#ffffff" }}
                >
                  <Icon className="size-5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {a.veiculoMarca} {a.veiculoModelo}
                  </p>
                  <p className="flex items-center gap-1 truncate text-xs text-white/60">
                    <User className="size-3 shrink-0" />
                    {a.clienteNome}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <div
                    className={cn(
                      "flex items-center gap-1 text-[11px] font-medium",
                      atrasado ? "text-red-400" : "text-white/60"
                    )}
                  >
                    {atrasado ? <AlertTriangle className="size-3" /> : <CalendarClock className="size-3" />}
                    {atrasado
                      ? dias < 0
                        ? `${Math.abs(dias)}d atraso`
                        : `atraso ${hora}`
                      : dias === 0
                        ? `hoje ${hora}`
                        : `${dias}d`}
                  </div>
                  {a.statusPagamento !== "pago" && (
                    <Badge variant="warning" className="px-1.5 py-0 text-[10px]">
                      Pendente
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
