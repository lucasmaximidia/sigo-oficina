import Link from "next/link";
import { TrendingUp, TrendingDown, Scale, BarChart3, CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MesSeletor } from "@/components/pessoal/mes-seletor";
import { RendaSection } from "@/components/pessoal/renda-section";
import { ItensMesSection } from "@/components/pessoal/itens-mes-section";
import { CartoesSection } from "@/components/pessoal/cartoes-section";
import { CategoriaChart } from "@/components/pessoal/categoria-chart";
import { ARecemberSection } from "@/components/pessoal/a-receber-section";
import { formatCurrency } from "@/lib/utils";
import { mesAtualStr } from "@/lib/pessoal-datas";
import { copiarFixasCartaoMesAtual } from "@/lib/pessoal-copiar-fixas";
import type { PessoalCartaoCategoria } from "@/types";

export const dynamic = "force-dynamic";

export default async function PessoalPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const supabase = await createClient();
  const { mes: mesParam } = await searchParams;
  const mes = mesParam && /^\d{4}-\d{2}-\d{2}$/.test(mesParam) ? mesParam : mesAtualStr();

  // Conta fixa no cartão repete sozinha a cada mês — ao abrir a página no
  // mês atual, garante que já esteja copiada antes de buscar os dados
  // (só faz sentido pro mês corrente, nunca ao navegar pra um mês passado).
  if (mes === mesAtualStr()) {
    await copiarFixasCartaoMesAtual();
  }

  const [{ data: renda }, { data: itensMes }, { data: cartoes }, { data: lancamentos }] = await Promise.all([
    supabase.from("pessoal_renda").select("*").eq("mes", mes).is("deletado_em", null).order("created_at"),
    supabase.from("pessoal_itens_mes").select("*").eq("mes", mes).is("deletado_em", null).order("created_at"),
    supabase.from("pessoal_cartoes").select("*").order("nome"),
    supabase.from("pessoal_cartao_lancamentos").select("*").eq("mes", mes).is("deletado_em", null).order("created_at"),
  ]);

  const totalRendaPrevisto = (renda ?? []).reduce((acc, r) => acc + r.valor_previsto, 0);
  const totalRendaReal = (renda ?? []).reduce((acc, r) => acc + (r.valor_real ?? 0), 0);

  const totalItensPrevisto = (itensMes ?? []).reduce((acc, i) => acc + i.valor_previsto, 0);
  const totalItensReal = (itensMes ?? []).reduce((acc, i) => acc + (i.valor_real ?? 0), 0);

  const totalCartaoPrevisto = (lancamentos ?? []).reduce((acc, l) => acc + l.valor_previsto, 0);
  const totalCartaoReal = (lancamentos ?? []).reduce((acc, l) => acc + (l.valor_real ?? 0), 0);

  const totalDespesasPrevisto = totalItensPrevisto + totalCartaoPrevisto;
  const totalDespesasReal = totalItensReal + totalCartaoReal;

  const saldoPrevisto = totalRendaPrevisto - totalDespesasPrevisto;
  const saldoReal = totalRendaReal - totalDespesasReal;

  const categorias = Array.from(
    (lancamentos ?? []).reduce((acc, l) => {
      acc.set(l.categoria, (acc.get(l.categoria) ?? 0) + (l.valor_real ?? l.valor_previsto));
      return acc;
    }, new Map<PessoalCartaoCategoria, number>())
  ).map(([categoria, valor]) => ({ categoria, valor }));

  return (
    <div>
      <PageHeader
        title="Financeiro Pessoal"
        description="Controle particular de contas da casa e cartões — separado da oficina."
        actions={
          <Button asChild variant="outline">
            <Link href="/pessoal/ano">
              <BarChart3 className="size-4" />
              Resumo anual
            </Link>
          </Button>
        }
      />

      <div className="mt-4">
        <MesSeletor mes={mes} basePath="/pessoal" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={TrendingUp} label="Renda (real)" value={formatCurrency(totalRendaReal)} tone="success" hint={`Previsto ${formatCurrency(totalRendaPrevisto)}`} />
        <StatCard icon={TrendingDown} label="Despesas (real)" value={formatCurrency(totalDespesasReal)} tone="danger" hint={`Previsto ${formatCurrency(totalDespesasPrevisto)}`} />
        <StatCard
          icon={Scale}
          label="Saldo (real)"
          value={formatCurrency(saldoReal)}
          tone={saldoReal >= 0 ? "success" : "danger"}
          hint={`Previsto ${formatCurrency(saldoPrevisto)}`}
        />
        <StatCard icon={CreditCard} label="Cartões no mês" value={formatCurrency(totalCartaoReal || totalCartaoPrevisto)} hint={`${(lancamentos ?? []).length} lançamentos`} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <RendaSection renda={renda ?? []} mes={mes} />
          <ItensMesSection itens={itensMes ?? []} mes={mes} renda={renda ?? []} />
        </div>
        <div className="flex flex-col gap-4">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="size-4.5 text-primary" />
                Gastos do cartão por categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CategoriaChart dados={categorias} />
            </CardContent>
          </Card>
          <ARecemberSection lancamentos={lancamentos ?? []} renda={renda ?? []} mes={mes} />
        </div>
      </div>

      <div className="mt-4">
        <CartoesSection cartoes={cartoes ?? []} lancamentos={lancamentos ?? []} mes={mes} />
      </div>
    </div>
  );
}
