"use client";

import { useMemo, useState } from "react";
import { Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ResponsiveList } from "@/components/ui/responsive-list";
import { TableHead, TableRow, TableCell } from "@/components/ui/table";
import { FiltroOrdenacaoBar } from "@/components/ui/filtro-ordenacao-bar";
import { filtrarEOrdenar, type Ordenacao } from "@/lib/filtro-ordenacao";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const CARTAO_LABEL: Record<string, string> = {
  "15MIN": "15 MIN",
  "5MIN": "5 MIN",
  LIVRE: "Livre",
};

const MOTIVO_LABEL: Record<string, string> = {
  tempo: "Tempo esgotado",
  fim: "Finalizado no cartão",
};

interface SessaoHistorico {
  id: string;
  numero_carrinho: number;
  cartao_tipo: string;
  iniciado_em: string | null;
  finalizado_em: string | null;
  minutos: number;
  minutos_liberados: number;
  motivo_termino: string;
  quedas_energia: number;
  qtd_15min: number;
  qtd_5min: number;
  valor: number;
  created_at: string;
}

function horarioOuSemHorario(valor: string | null) {
  return valor ? formatDateTime(valor) : "sem horário";
}

export function SessoesHistorico({
  sessoes,
  carrinhos,
}: {
  sessoes: SessaoHistorico[];
  carrinhos: { id: number; label: string }[];
}) {
  const [carrinhoFiltro, setCarrinhoFiltro] = useState<string>("todos");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("data_desc");
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFim, setPeriodoFim] = useState("");

  const sessoesFiltradasPorCarrinho = useMemo(
    () =>
      carrinhoFiltro === "todos" ? sessoes : sessoes.filter((s) => String(s.numero_carrinho) === carrinhoFiltro),
    [sessoes, carrinhoFiltro]
  );

  const sessoesOrdenadas = useMemo(
    () =>
      filtrarEOrdenar(
        sessoesFiltradasPorCarrinho,
        (s) => s.created_at.slice(0, 10),
        (s) => s.minutos,
        ordenacao,
        periodoInicio,
        periodoFim
      ),
    [sessoesFiltradasPorCarrinho, ordenacao, periodoInicio, periodoFim]
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Select value={carrinhoFiltro} onValueChange={setCarrinhoFiltro}>
          <SelectTrigger className="w-auto min-w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="locacao-theme">
            <SelectItem value="todos">Todos os carrinhos</SelectItem>
            {carrinhos.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <FiltroOrdenacaoBar
        ordenacao={ordenacao}
        onOrdenacaoChange={setOrdenacao}
        periodoInicio={periodoInicio}
        onPeriodoInicioChange={setPeriodoInicio}
        periodoFim={periodoFim}
        onPeriodoFimChange={setPeriodoFim}
      />

      <Card className="overflow-hidden p-0">
      <ResponsiveList
        items={sessoesOrdenadas}
        colSpan={10}
        header={
          <>
            <TableHead>Carrinho</TableHead>
            <TableHead>Início</TableHead>
            <TableHead>Fim</TableHead>
            <TableHead>Cartão</TableHead>
            <TableHead>Minutos</TableHead>
            <TableHead>Qtd 15</TableHead>
            <TableHead>Qtd 5</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Terminou por</TableHead>
            <TableHead>Quedas</TableHead>
          </>
        }
        renderRow={(s) => (
          <TableRow key={s.id}>
            <TableCell>#{s.numero_carrinho}</TableCell>
            <TableCell>{horarioOuSemHorario(s.iniciado_em)}</TableCell>
            <TableCell>{horarioOuSemHorario(s.finalizado_em)}</TableCell>
            <TableCell>{CARTAO_LABEL[s.cartao_tipo] ?? s.cartao_tipo}</TableCell>
            <TableCell>
              {s.minutos} min{s.minutos_liberados > 0 ? ` (${s.minutos_liberados} liberados)` : ""}
            </TableCell>
            <TableCell>{s.qtd_15min}</TableCell>
            <TableCell>{s.qtd_5min}</TableCell>
            <TableCell>{formatCurrency(s.valor)}</TableCell>
            <TableCell>{MOTIVO_LABEL[s.motivo_termino] ?? s.motivo_termino}</TableCell>
            <TableCell>
              {s.quedas_energia > 0 ? (
                <Badge variant="destructive" className="gap-1">
                  <Zap className="size-3" />
                  {s.quedas_energia}
                </Badge>
              ) : (
                "—"
              )}
            </TableCell>
          </TableRow>
        )}
        renderCard={(s) => (
          <div key={s.id} className="flex flex-col gap-1.5 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                Carrinho #{s.numero_carrinho} · {CARTAO_LABEL[s.cartao_tipo] ?? s.cartao_tipo}
              </span>
              {s.quedas_energia > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <Zap className="size-3" />
                  {s.quedas_energia}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {horarioOuSemHorario(s.iniciado_em)} → {horarioOuSemHorario(s.finalizado_em)}
            </p>
            <p className="text-muted-foreground">
              {s.minutos} min rodados{s.minutos_liberados > 0 ? ` · ${s.minutos_liberados} liberados` : ""} ·{" "}
              {MOTIVO_LABEL[s.motivo_termino] ?? s.motivo_termino}
            </p>
            <p className="text-muted-foreground">
              Qtd 15: {s.qtd_15min} · Qtd 5: {s.qtd_5min} · Valor: {formatCurrency(s.valor)}
            </p>
          </div>
        )}
        empty={<p className="py-6 text-center text-sm text-muted-foreground">Nenhuma sessão encontrada.</p>}
      />
      </Card>
    </div>
  );
}
