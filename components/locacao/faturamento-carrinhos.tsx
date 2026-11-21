"use client";

import { useMemo, useState } from "react";
import { Wallet, Bike, Clock, Timer, Infinity as InfinityIcon, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { ResponsiveList } from "@/components/ui/responsive-list";
import { TableHead, TableRow, TableCell } from "@/components/ui/table";
import { FaturamentoChart } from "@/components/locacao/faturamento-chart";
import { LancarCaixaDialog } from "@/components/locacao/lancar-caixa-dialog";
import { RecalcularValoresDialog } from "@/components/locacao/recalcular-valores-dialog";
import { agoraBR, diasAPartirDe, formatCurrency, formatDate, hojeBR } from "@/lib/utils";
import type { LocacaoCarrinhoFaturamentoDiario } from "@/types";

type Preset = "hoje" | "ontem" | "semana" | "mes" | "intervalo";

const PRESET_LABEL: Record<Preset, string> = {
  hoje: "Hoje",
  ontem: "Ontem",
  semana: "Últimos 7 dias",
  mes: "Este mês",
  intervalo: "Intervalo",
};

function periodoDoPreset(preset: Preset, inicioCustom: string, fimCustom: string) {
  const hoje = hojeBR();
  switch (preset) {
    case "hoje":
      return { inicio: hoje, fim: hoje };
    case "ontem": {
      const ontem = diasAPartirDe(hoje, -1);
      return { inicio: ontem, fim: ontem };
    }
    case "semana":
      return { inicio: diasAPartirDe(hoje, -6), fim: hoje };
    case "mes": {
      const { ano, mes } = agoraBR();
      return { inicio: `${ano}-${String(mes).padStart(2, "0")}-01`, fim: hoje };
    }
    case "intervalo":
      return { inicio: inicioCustom || hoje, fim: fimCustom || hoje };
  }
}

export function FaturamentoCarrinhos({
  linhas,
  carrinhos,
}: {
  linhas: LocacaoCarrinhoFaturamentoDiario[];
  carrinhos: { id: string; label: string }[];
}) {
  const [preset, setPreset] = useState<Preset>("mes");
  const [intervaloInicio, setIntervaloInicio] = useState(hojeBR());
  const [intervaloFim, setIntervaloFim] = useState(hojeBR());
  const [carrinhoFiltro, setCarrinhoFiltro] = useState("todos");

  const { inicio, fim } = periodoDoPreset(preset, intervaloInicio, intervaloFim);

  const linhasFiltradas = useMemo(
    () =>
      linhas.filter(
        (l) => l.dia >= inicio && l.dia <= fim && (carrinhoFiltro === "todos" || l.dispositivo_id === carrinhoFiltro)
      ),
    [linhas, inicio, fim, carrinhoFiltro]
  );

  const totais = useMemo(() => {
    return linhasFiltradas.reduce(
      (acc, l) => {
        acc.valor += l.valor_total;
        acc.alugueis += l.alugueis;
        acc.alugueisLivre += l.alugueis_livre;
        acc.cartoes15 += l.cartoes_15min;
        acc.cartoes5 += l.cartoes_5min;
        acc.minutos += l.minutos_rodados;
        return acc;
      },
      { valor: 0, alugueis: 0, alugueisLivre: 0, cartoes15: 0, cartoes5: 0, minutos: 0 }
    );
  }, [linhasFiltradas]);

  const ticketMedio = totais.alugueis > 0 ? totais.valor / totais.alugueis : 0;

  // Uma série por carrinho (ordenada por número) — com só 1 carrinho no
  // resultado, o gráfico desenha como série única (sem legenda).
  const seriesGrafico = useMemo(() => {
    const porCarrinho = new Map<string, { id: string; label: string; numero: number; pontos: { dia: string; valor: number }[] }>();
    for (const l of linhasFiltradas) {
      const serie = porCarrinho.get(l.dispositivo_id) ?? {
        id: l.dispositivo_id,
        label: `Carrinho #${l.numero_carrinho}`,
        numero: l.numero_carrinho,
        pontos: [],
      };
      serie.pontos.push({ dia: l.dia, valor: l.valor_total });
      porCarrinho.set(l.dispositivo_id, serie);
    }
    return Array.from(porCarrinho.values()).sort((a, b) => a.numero - b.numero);
  }, [linhasFiltradas]);

  const linhasTabela = useMemo(
    () => [...linhasFiltradas].sort((a, b) => b.dia.localeCompare(a.dia) || a.numero_carrinho - b.numero_carrinho),
    [linhasFiltradas]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={preset} onValueChange={(v) => setPreset(v as Preset)}>
          <SelectTrigger className="w-auto min-w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="locacao-theme">
            {Object.entries(PRESET_LABEL).map(([valor, label]) => (
              <SelectItem key={valor} value={valor}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {preset === "intervalo" && (
          <div className="flex items-center gap-1.5">
            <Input type="date" value={intervaloInicio} onChange={(e) => setIntervaloInicio(e.target.value)} className="w-auto" />
            <span className="text-sm text-muted-foreground">até</span>
            <Input type="date" value={intervaloFim} onChange={(e) => setIntervaloFim(e.target.value)} className="w-auto" />
          </div>
        )}

        <Select value={carrinhoFiltro} onValueChange={setCarrinhoFiltro}>
          <SelectTrigger className="w-auto min-w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="locacao-theme">
            <SelectItem value="todos">Todos os carrinhos</SelectItem>
            {carrinhos.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex flex-wrap gap-2">
          <RecalcularValoresDialog periodoInicio={inicio} periodoFim={fim} carrinhoFiltro={carrinhoFiltro} />
          <LancarCaixaDialog periodoInicio={inicio} periodoFim={fim} carrinhoFiltro={carrinhoFiltro} carrinhos={carrinhos} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Wallet} label="Valor" value={formatCurrency(totais.valor)} tone="highlight" />
        <StatCard icon={Bike} label="Aluguéis" value={totais.alugueis} />
        <StatCard icon={Clock} label="Cartão 15MIN" value={totais.cartoes15} />
        <StatCard icon={Timer} label="Cartão 5MIN" value={totais.cartoes5} />
        <StatCard icon={InfinityIcon} label="LIVRE" value={totais.alugueisLivre} />
        <StatCard icon={TrendingUp} label="Ticket médio" value={formatCurrency(ticketMedio)} tone="success" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Valor por dia</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <FaturamentoChart series={seriesGrafico} />
        </CardContent>
      </Card>

      <Card className="overflow-hidden p-0">
        <ResponsiveList
          items={linhasTabela}
          colSpan={7}
          header={
            <>
              <TableHead>Dia</TableHead>
              <TableHead>Carrinho</TableHead>
              <TableHead>Aluguéis</TableHead>
              <TableHead>15MIN</TableHead>
              <TableHead>5MIN</TableHead>
              <TableHead>LIVRE</TableHead>
              <TableHead>Valor</TableHead>
            </>
          }
          renderRow={(l) => (
            <TableRow key={`${l.dia}-${l.dispositivo_id}`}>
              <TableCell>{formatDate(l.dia)}</TableCell>
              <TableCell>#{l.numero_carrinho}</TableCell>
              <TableCell>{l.alugueis}</TableCell>
              <TableCell>{l.cartoes_15min}</TableCell>
              <TableCell>{l.cartoes_5min}</TableCell>
              <TableCell>{l.alugueis_livre}</TableCell>
              <TableCell>{formatCurrency(l.valor_total)}</TableCell>
            </TableRow>
          )}
          renderCard={(l) => (
            <div key={`${l.dia}-${l.dispositivo_id}`} className="flex flex-col gap-1 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {formatDate(l.dia)} · Carrinho #{l.numero_carrinho}
                </span>
                <span className="font-semibold">{formatCurrency(l.valor_total)}</span>
              </div>
              <p className="text-muted-foreground">
                {l.alugueis} aluguel(éis) · 15MIN {l.cartoes_15min} · 5MIN {l.cartoes_5min} · LIVRE {l.alugueis_livre}
              </p>
            </div>
          )}
          empty={<p className="py-6 text-center text-sm text-muted-foreground">Nenhum faturamento no período.</p>}
        />
      </Card>
    </div>
  );
}
