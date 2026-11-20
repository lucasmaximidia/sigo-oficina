"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Wifi, WifiOff, BatteryWarning, Gauge, Cpu } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RegenerarTokenDialog } from "@/components/locacao/regenerar-token-dialog";
import { vincularVeiculoCarrinho } from "@/lib/locacao-dispositivos-actions";
import { dispositivoEstaOnline, percentualBateria, formatarHorimetro } from "@/lib/locacao-dispositivos-status";
import { formatDateTime } from "@/lib/utils";
import type { LocacaoDispositivo, LocacaoVeiculo } from "@/types";

export function CarrinhoCard({
  dispositivo,
  veiculo,
  veiculosDisponiveis,
}: {
  dispositivo: LocacaoDispositivo;
  veiculo: Pick<LocacaoVeiculo, "id" | "marca" | "modelo"> | null;
  veiculosDisponiveis: Pick<LocacaoVeiculo, "id" | "marca" | "modelo">[];
}) {
  const [isPending, startTransition] = useTransition();
  const online = dispositivoEstaOnline(dispositivo.ultima_conexao);
  const bateriaPct = percentualBateria(dispositivo.tensao_bateria);

  function vincular(veiculoId: string) {
    startTransition(async () => {
      try {
        await vincularVeiculoCarrinho(dispositivo.id, veiculoId === "nenhum" ? null : veiculoId);
        toast.success("Veículo atualizado");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao vincular veículo");
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Cpu className="size-4 text-muted-foreground" />
          <CardTitle>Carrinho #{dispositivo.numero_carrinho}</CardTitle>
        </div>
        <Badge variant={online ? "success" : "secondary"} className="gap-1">
          {online ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
          {online ? "Online" : "Offline"}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-0">
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">Veículo</p>
          <Select
            value={veiculo?.id ?? "nenhum"}
            onValueChange={vincular}
            disabled={isPending}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="locacao-theme">
              <SelectItem value="nenhum">Sem veículo ligado</SelectItem>
              {veiculosDisponiveis.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.marca} {v.modelo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Última conexão</p>
            <p className="font-medium">
              {dispositivo.ultima_conexao ? formatDateTime(dispositivo.ultima_conexao) : "Nunca conectou"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Horímetro</p>
            <p className="font-medium">{formatarHorimetro(dispositivo.horimetro_minutos)}</p>
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              {bateriaPct != null && bateriaPct <= 10 && <BatteryWarning className="size-3.5 text-destructive" />}
              Bateria
            </span>
            <span className="font-medium text-foreground">
              {dispositivo.tensao_bateria != null
                ? `${dispositivo.tensao_bateria.toFixed(1)}V${bateriaPct != null ? ` · ${bateriaPct}%` : ""}`
                : "—"}
            </span>
          </div>
          <Progress
            value={bateriaPct ?? 0}
            indicatorClassName={bateriaPct != null && bateriaPct <= 10 ? "bg-destructive" : undefined}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-xs text-muted-foreground">15MIN</p>
            <p className="font-semibold">{dispositivo.contador_15min}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-xs text-muted-foreground">5MIN</p>
            <p className="font-semibold">{dispositivo.contador_5min}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-xs text-muted-foreground">LIVRE</p>
            <p className="font-semibold">{dispositivo.contador_livre}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Gauge className="size-3.5" />
            Firmware {dispositivo.firmware_versao ?? "—"}
          </span>
          {dispositivo.fila_pendente > 0 && (
            <Badge variant="warning">{dispositivo.fila_pendente} pendente(s) de envio</Badge>
          )}
        </div>

        <RegenerarTokenDialog dispositivoId={dispositivo.id} numeroCarrinho={dispositivo.numero_carrinho} />
      </CardContent>
    </Card>
  );
}
