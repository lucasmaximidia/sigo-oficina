import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { formatCurrency, agoraBR } from "@/lib/utils";
import { MESES_LABEL } from "@/lib/pessoal-status";

export const dynamic = "force-dynamic";

export default async function PessoalAnoPage({ searchParams }: { searchParams: Promise<{ ano?: string }> }) {
  const supabase = await createClient();
  const { ano: anoParam } = await searchParams;
  const anoAtual = agoraBR().ano;
  const ano = anoParam && /^\d{4}$/.test(anoParam) ? parseInt(anoParam, 10) : anoAtual;

  const inicio = `${ano}-01-01`;
  const fim = `${ano}-12-01`;

  const [{ data: renda }, { data: itensMes }, { data: lancamentos }] = await Promise.all([
    supabase.from("pessoal_renda").select("mes, valor_previsto, valor_real").gte("mes", inicio).lte("mes", fim).is("deletado_em", null),
    supabase.from("pessoal_itens_mes").select("mes, valor_previsto, valor_real").gte("mes", inicio).lte("mes", fim).is("deletado_em", null),
    supabase.from("pessoal_cartao_lancamentos").select("mes, valor_previsto, valor_real").gte("mes", inicio).lte("mes", fim).is("deletado_em", null),
  ]);

  const mesesBase = Array.from({ length: 12 }, (_, i) => {
    const mesStr = `${ano}-${String(i + 1).padStart(2, "0")}-01`;
    const rendaDoMes = (renda ?? []).filter((r) => r.mes === mesStr);
    const itensDoMes = (itensMes ?? []).filter((item) => item.mes === mesStr);
    const lancamentosDoMes = (lancamentos ?? []).filter((l) => l.mes === mesStr);

    const rendaPrevisto = rendaDoMes.reduce((acc, r) => acc + r.valor_previsto, 0);
    const rendaReal = rendaDoMes.reduce((acc, r) => acc + (r.valor_real ?? 0), 0);
    const despesasPrevisto =
      itensDoMes.reduce((acc, item) => acc + item.valor_previsto, 0) + lancamentosDoMes.reduce((acc, l) => acc + l.valor_previsto, 0);
    const despesasReal =
      itensDoMes.reduce((acc, item) => acc + (item.valor_real ?? 0), 0) + lancamentosDoMes.reduce((acc, l) => acc + (l.valor_real ?? 0), 0);

    return {
      mes: mesStr,
      label: MESES_LABEL[i],
      rendaPrevisto,
      rendaReal,
      despesasPrevisto,
      despesasReal,
      saldoPrevisto: rendaPrevisto - despesasPrevisto,
      saldoReal: rendaReal - despesasReal,
    };
  });

  const meses = mesesBase.reduce<(typeof mesesBase[number] & { saldoAcumulado: number })[]>((acc, m) => {
    const acumuladoAnterior = acc.length > 0 ? acc[acc.length - 1].saldoAcumulado : 0;
    acc.push({ ...m, saldoAcumulado: acumuladoAnterior + m.saldoReal });
    return acc;
  }, []);
  const saldoAcumulado = meses[meses.length - 1]?.saldoAcumulado ?? 0;

  const totais = meses.reduce(
    (acc, m) => ({
      rendaPrevisto: acc.rendaPrevisto + m.rendaPrevisto,
      rendaReal: acc.rendaReal + m.rendaReal,
      despesasPrevisto: acc.despesasPrevisto + m.despesasPrevisto,
      despesasReal: acc.despesasReal + m.despesasReal,
    }),
    { rendaPrevisto: 0, rendaReal: 0, despesasPrevisto: 0, despesasReal: 0 }
  );

  return (
    <div>
      <Link href="/pessoal" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Voltar pro mês
      </Link>
      <PageHeader title="Resumo Anual" description="Previsto vs. real mês a mês, com o balanço de caixa acumulado no ano." />

      <div className="mt-4 flex items-center gap-2">
        <Button asChild variant="outline" size="icon">
          <Link href={`/pessoal/ano?ano=${ano - 1}`} aria-label="Ano anterior">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <span className="min-w-16 text-center text-sm font-semibold text-foreground">{ano}</span>
        <Button asChild variant="outline" size="icon">
          <Link href={`/pessoal/ano?ano=${ano + 1}`} aria-label="Próximo ano">
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </div>

      <Card className="mt-4 overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mês</TableHead>
              <TableHead className="text-right">Renda Prevista</TableHead>
              <TableHead className="text-right">Renda Real</TableHead>
              <TableHead className="text-right">Despesa Prevista</TableHead>
              <TableHead className="text-right">Despesa Real</TableHead>
              <TableHead className="text-right">Saldo Previsto</TableHead>
              <TableHead className="text-right">Saldo Real</TableHead>
              <TableHead className="text-right">Acumulado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {meses.map((m) => (
              <TableRow key={m.mes}>
                <TableCell className="font-medium text-foreground">
                  <Link href={`/pessoal?mes=${m.mes}`} className="hover:underline">
                    {m.label}
                  </Link>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">{formatCurrency(m.rendaPrevisto)}</TableCell>
                <TableCell className="text-right text-success">{formatCurrency(m.rendaReal)}</TableCell>
                <TableCell className="text-right text-muted-foreground">{formatCurrency(m.despesasPrevisto)}</TableCell>
                <TableCell className="text-right text-destructive">{formatCurrency(m.despesasReal)}</TableCell>
                <TableCell className="text-right text-muted-foreground">{formatCurrency(m.saldoPrevisto)}</TableCell>
                <TableCell className={`text-right font-medium ${m.saldoReal >= 0 ? "text-success" : "text-destructive"}`}>
                  {formatCurrency(m.saldoReal)}
                </TableCell>
                <TableCell className={`text-right font-semibold ${m.saldoAcumulado >= 0 ? "text-success" : "text-destructive"}`}>
                  {formatCurrency(m.saldoAcumulado)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t-2 border-border">
              <TableCell className="font-semibold text-foreground">Total</TableCell>
              <TableCell className="text-right font-semibold text-muted-foreground">{formatCurrency(totais.rendaPrevisto)}</TableCell>
              <TableCell className="text-right font-semibold text-success">{formatCurrency(totais.rendaReal)}</TableCell>
              <TableCell className="text-right font-semibold text-muted-foreground">{formatCurrency(totais.despesasPrevisto)}</TableCell>
              <TableCell className="text-right font-semibold text-destructive">{formatCurrency(totais.despesasReal)}</TableCell>
              <TableCell className="text-right font-semibold text-muted-foreground">
                {formatCurrency(totais.rendaPrevisto - totais.despesasPrevisto)}
              </TableCell>
              <TableCell className="text-right font-semibold">{formatCurrency(totais.rendaReal - totais.despesasReal)}</TableCell>
              <TableCell className="text-right font-semibold">{formatCurrency(saldoAcumulado)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
