"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { ChevronDown, Copy } from "lucide-react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { PrevistoReal } from "@/components/pessoal/previsto-real";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LancarItemMesDialog } from "@/components/pessoal/lancar-item-mes-dialog";
import { ConfirmarItemMesDialog } from "@/components/pessoal/confirmar-item-mes-dialog";
import { EditarItemMesDialog } from "@/components/pessoal/editar-item-mes-dialog";
import { ExcluirItemMesButton } from "@/components/pessoal/pessoal-excluir-buttons";
import { copiarItensMesAnterior } from "@/lib/pessoal-actions";
import { useLembrarAberto } from "@/lib/use-lembrar-aberto";
import { PESSOAL_SECAO_LABEL, calcularDizimo, salarioDoDizimo } from "@/lib/pessoal-status";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { PessoalItemMes, PessoalItemSecao, PessoalRenda } from "@/types";

const SECOES: PessoalItemSecao[] = ["fixa", "carro", "dizimo", "extra"];

const DIZIMO_SUGESTOES = [
  { descricao: "LUCAS", label: "Lucas" },
  { descricao: "JÉSSICA", label: "Jéssica" },
];

export function ItensMesSection({ itens, mes, renda }: { itens: PessoalItemMes[]; mes: string; renda: PessoalRenda[] }) {
  const [isPending, startTransition] = useTransition();

  function handleCopiar() {
    startTransition(async () => {
      try {
        await copiarItensMesAnterior(mes);
        toast.success("Itens copiados do mês anterior");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao copiar");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={handleCopiar} disabled={isPending}>
          <Copy className="size-4" />
          {isPending ? "Copiando..." : "Copiar fixas/carro/dízimo/cartão do mês anterior"}
        </Button>
      </div>

      {SECOES.map((secao) => {
        const itensDaSecao = itens.filter((i) => i.secao === secao);
        const totalPrevisto = itensDaSecao.reduce((acc, i) => acc + i.valor_previsto, 0);
        const totalReal = itensDaSecao.reduce((acc, i) => acc + (i.valor_real ?? 0), 0);

        // Itens sem grupo renderizam soltos, como sempre. Itens com o mesmo
        // grupo (ex: "ENERGIA") clusterizam num só bloco com subtotal — a
        // ordem dos clusters segue a primeira vez que cada grupo aparece.
        const semGrupo = itensDaSecao.filter((i) => !i.grupo);
        const gruposOrdem: string[] = [];
        const porGrupo = new Map<string, PessoalItemMes[]>();
        for (const item of itensDaSecao) {
          if (!item.grupo) continue;
          if (!porGrupo.has(item.grupo)) {
            porGrupo.set(item.grupo, []);
            gruposOrdem.push(item.grupo);
          }
          porGrupo.get(item.grupo)!.push(item);
        }
        const gruposExistentes = gruposOrdem;

        return (
          <CollapsibleCard
            key={secao}
            id={`itens-${secao}`}
            title={PESSOAL_SECAO_LABEL[secao]}
            meta={<PrevistoReal previsto={totalPrevisto} real={totalReal} />}
            defaultOpen={itensDaSecao.length > 0}
            actions={
              <>
                {secao === "dizimo" &&
                  DIZIMO_SUGESTOES.filter(
                    ({ descricao }) => !itensDaSecao.some((i) => i.descricao.toUpperCase() === descricao)
                  ).map(({ descricao, label }) => {
                    const salario = salarioDoDizimo(renda, descricao);
                    if (!salario) return null;
                    const sugestao = calcularDizimo(salario.valor_previsto);
                    return (
                      <LancarItemMesDialog
                        key={descricao}
                        mes={mes}
                        secao={secao}
                        triggerLabel={`Dízimo ${label} (${formatCurrency(sugestao)})`}
                        descricaoPadrao={descricao}
                        valorPrevistoPadrao={sugestao}
                        gruposExistentes={gruposExistentes}
                      />
                    );
                  })}
                <LancarItemMesDialog mes={mes} secao={secao} gruposExistentes={gruposExistentes} />
              </>
            }
          >
            {itensDaSecao.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum item ainda.</p>
            ) : (
              <>
                {semGrupo.map((item) => (
                  <ItemMesRow key={item.id} item={item} renda={renda} secao={secao} gruposExistentes={gruposExistentes} />
                ))}
                {gruposOrdem.map((grupo) => (
                  <GrupoCluster
                    key={grupo}
                    secao={secao}
                    grupo={grupo}
                    itensDoGrupo={porGrupo.get(grupo)!}
                    renda={renda}
                    gruposExistentes={gruposExistentes}
                  />
                ))}
              </>
            )}
          </CollapsibleCard>
        );
      })}
    </div>
  );
}

function GrupoCluster({
  secao,
  grupo,
  itensDoGrupo,
  renda,
  gruposExistentes,
}: {
  secao: PessoalItemSecao;
  grupo: string;
  itensDoGrupo: PessoalItemMes[];
  renda: PessoalRenda[];
  gruposExistentes: string[];
}) {
  const totalPrevisto = itensDoGrupo.reduce((acc, i) => acc + i.valor_previsto, 0);
  const totalReal = itensDoGrupo.reduce((acc, i) => acc + (i.valor_real ?? 0), 0);
  const todosPagos = itensDoGrupo.every((i) => i.valor_real != null);

  // Nasce fechado assim que o grupo inteiro já foi pago — não precisa
  // continuar ocupando espaço depois de resolvido. Enquanto houver pendência
  // (ou a próxima vez que alguém reabrir manualmente), fica aberto.
  const { aberto, alternar } = useLembrarAberto(`itens-${secao}-grupo-${grupo}`, !todosPagos);

  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-2">
      <button
        type="button"
        onClick={alternar}
        aria-expanded={aberto}
        className="flex w-full items-center justify-between gap-3 rounded-md p-1 text-left"
      >
        <span className="flex min-w-0 items-center gap-2">
          <ChevronDown
            className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200", !aberto && "-rotate-90")}
          />
          <span className="truncate text-sm font-semibold text-foreground">{grupo}</span>
          {todosPagos && (
            <Badge variant="success" className="shrink-0">
              Pago
            </Badge>
          )}
        </span>
        <PrevistoReal previsto={totalPrevisto} real={totalReal} />
      </button>
      {aberto && (
        <div className="mt-2 flex flex-col gap-2">
          {itensDoGrupo.map((item) => (
            <ItemMesRow key={item.id} item={item} renda={renda} secao={secao} gruposExistentes={gruposExistentes} />
          ))}
        </div>
      )}
    </div>
  );
}

function ItemMesRow({
  item,
  renda,
  secao,
  gruposExistentes,
}: {
  item: PessoalItemMes;
  renda: PessoalRenda[];
  secao: PessoalItemSecao;
  gruposExistentes: string[];
}) {
  const salarioDizimo = secao === "dizimo" ? salarioDoDizimo(renda, item.descricao) : null;
  const valorSugerido = salarioDizimo?.valor_real != null ? calcularDizimo(salarioDizimo.valor_real) : undefined;

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-lg border border-border bg-card p-3 text-sm">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate font-medium text-foreground">{item.descricao}</span>
        <span className="text-xs text-muted-foreground">
          Previsto {formatCurrency(item.valor_previsto)}
          {item.forma_pagamento ? ` · ${item.forma_pagamento}` : ""}
          {item.pago_em ? ` · pago em ${formatDate(item.pago_em)}` : ""}
        </span>
      </div>
      {item.valor_real != null ? (
        <Badge variant="success">{formatCurrency(item.valor_real)}</Badge>
      ) : (
        <ConfirmarItemMesDialog
          id={item.id}
          descricao={item.descricao}
          valorPrevisto={item.valor_previsto}
          valorSugerido={valorSugerido}
        />
      )}
      <EditarItemMesDialog item={item} renda={renda} gruposExistentes={gruposExistentes} />
      <ExcluirItemMesButton id={item.id} descricao={item.descricao} />
    </div>
  );
}
