import Link from "next/link";
import { AlertTriangle, ClipboardList, Truck, FileBarChart, TrendingUp, Wrench, ShoppingCart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LancarDespesaDialog } from "@/components/financeiro/lancar-despesa-dialog";
import { NovaContaDialog } from "@/components/financeiro/nova-conta-dialog";
import { MarcarPagoButton } from "@/components/financeiro/marcar-pago-button";
import { MarcarFretePagoButton } from "@/components/financeiro/marcar-frete-pago-button";
import { ExcluirContaButton, ExcluirDespesaButton, ExcluirEntradaButton } from "@/components/financeiro/excluir-lancamento-buttons";
import { ExportarCsvButton } from "@/components/ui/exportar-csv-button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { contaStatusMap, freteStatusMap } from "@/lib/status";
import { formaPagamentoLabel } from "@/lib/relatorio-financeiro";
import type { ContaStatus } from "@/types";

interface OsEntradaRow {
  id: string;
  numero: number;
  data_pagamento: string | null;
  data_finalizacao: string | null;
  forma_pagamento: string | null;
  valor_mao_obra: number;
  valor_frete: number;
  desconto: number;
  valor_recebido_liquido: number | null;
  clientes: { nome: string } | null;
}

interface VendaEntradaRow {
  id: string;
  numero: number;
  created_at: string;
  forma_pagamento: string;
  total: number;
  cliente_nome_avulso: string | null;
  clientes: { nome: string } | null;
}

interface Entrada {
  id: string;
  tipo: "os" | "pdv";
  origemLabel: string;
  origemHref?: string;
  cliente: string;
  data: string;
  formaPagamento: string;
  valor: number;
}

interface FreteRow {
  id: string;
  os_id: string;
  valor_custo: number;
  status: "pendente" | "pago";
  data_pagamento: string | null;
  created_at: string;
  ordens_servico: { numero: number; valor_frete: number } | null;
  prestadores_frete: { nome: string } | null;
}

export const dynamic = "force-dynamic";

export default async function FinanceiroPage() {
  const hoje = new Date();
  const hojeStr = hoje.toISOString().slice(0, 10);
  const em7dias = new Date(hoje);
  em7dias.setDate(em7dias.getDate() + 7);

  const [{ data: contas }, { data: despesas }, { data: fretes }, { data: osPagas }, { data: vendas }] = await Promise.all([
    supabase.from("financeiro_contas").select("*").is("deletado_em", null).order("vencimento", { ascending: true }),
    supabase.from("financeiro_despesas").select("*").is("deletado_em", null).order("data", { ascending: false }),
    supabase
      .from("fretes")
      .select<string, FreteRow>(
        "id, os_id, valor_custo, status, data_pagamento, created_at, ordens_servico(numero, valor_frete), prestadores_frete(nome)"
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("ordens_servico")
      .select<string, OsEntradaRow>(
        "id, numero, data_pagamento, data_finalizacao, forma_pagamento, valor_mao_obra, valor_frete, desconto, valor_recebido_liquido, clientes(nome)"
      )
      .not("forma_pagamento", "is", null)
      .order("data_pagamento", { ascending: false }),
    supabase
      .from("vendas_pdv")
      .select<string, VendaEntradaRow>("id, numero, created_at, forma_pagamento, total, cliente_nome_avulso, clientes(nome)")
      .is("deletado_em", null)
      .order("created_at", { ascending: false }),
  ]);

  const osIdsPagas = (osPagas ?? []).map((os) => os.id);
  const { data: itensDasOsPagas } = osIdsPagas.length
    ? await supabase.from("os_itens").select("os_id, quantidade, valor_unitario").in("os_id", osIdsPagas)
    : { data: [] as { os_id: string; quantidade: number; valor_unitario: number }[] };

  const totalItensPorOs = new Map<string, number>();
  for (const item of itensDasOsPagas ?? []) {
    totalItensPorOs.set(item.os_id, (totalItensPorOs.get(item.os_id) ?? 0) + item.quantidade * item.valor_unitario);
  }

  const entradasOs: Entrada[] = (osPagas ?? []).map((os) => {
    const totalItens = totalItensPorOs.get(os.id) ?? 0;
    const totalCalculado = totalItens + os.valor_mao_obra + os.valor_frete - os.desconto;
    const valor = os.forma_pagamento === "cartao" && os.valor_recebido_liquido != null ? os.valor_recebido_liquido : totalCalculado;
    return {
      id: os.id,
      tipo: "os",
      origemLabel: `OS #OS-${String(os.numero).padStart(4, "0")}`,
      origemHref: `/ordens-servico/${os.id}`,
      cliente: os.clientes?.nome ?? "—",
      data: os.data_pagamento ?? (os.data_finalizacao ? os.data_finalizacao.slice(0, 10) : ""),
      formaPagamento: os.forma_pagamento ? (formaPagamentoLabel[os.forma_pagamento] ?? os.forma_pagamento) : "—",
      valor,
    };
  });

  const entradasPdv: Entrada[] = (vendas ?? []).map((venda) => ({
    id: venda.id,
    tipo: "pdv",
    origemLabel: `Venda #${String(venda.numero).padStart(4, "0")}`,
    cliente: venda.clientes?.nome ?? venda.cliente_nome_avulso ?? "Cliente avulso",
    data: venda.created_at.slice(0, 10),
    formaPagamento: formaPagamentoLabel[venda.forma_pagamento] ?? venda.forma_pagamento,
    valor: venda.total,
  }));

  const entradas = [...entradasOs, ...entradasPdv].sort((a, b) => (a.data < b.data ? 1 : -1));
  const totalRecebidoNoMes = entradas
    .filter((e) => e.data.startsWith(hojeStr.slice(0, 7)))
    .reduce((acc, e) => acc + e.valor, 0);

  const fretesPendentes = (fretes ?? []).filter((f) => f.status === "pendente");
  const totalFretePendente = fretesPendentes.reduce((acc, f) => acc + f.valor_custo, 0);
  const mesAtual = hojeStr.slice(0, 7);
  const totalFretePagoNoMes = (fretes ?? [])
    .filter((f) => f.status === "pago" && f.data_pagamento?.startsWith(mesAtual))
    .reduce((acc, f) => acc + f.valor_custo, 0);

  const vencendoHojeOuAtrasado = (contas ?? []).filter(
    (c) => c.status !== "pago" && c.vencimento <= hojeStr
  );
  const proximos7dias = (contas ?? []).filter(
    (c) => c.status !== "pago" && c.vencimento > hojeStr && c.vencimento <= em7dias.toISOString().slice(0, 10)
  );

  const totalVencendo = vencendoHojeOuAtrasado.reduce((acc, c) => acc + c.valor, 0);
  const totalProximos = proximos7dias.reduce((acc, c) => acc + c.valor, 0);

  return (
    <div>
      <PageHeader
        title="Financeiro"
        description="Gerencie suas contas a pagar e despesas operacionais."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/financeiro/relatorio">
                <FileBarChart className="size-4" />
                Relatório
              </Link>
            </Button>
            <LancarDespesaDialog />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
        <StatCard icon={TrendingUp} label="Recebido este mês" value={formatCurrency(totalRecebidoNoMes)} tone="success" />
        <StatCard icon={AlertTriangle} label="Vencendo Hoje/Atrasado" value={formatCurrency(totalVencendo)} tone="danger" />
        <StatCard icon={ClipboardList} label="Próximos 7 dias" value={formatCurrency(totalProximos)} />
      </div>

      <Tabs defaultValue="entradas" className="mt-5">
        <TabsList>
          <TabsTrigger value="entradas">Entradas</TabsTrigger>
          <TabsTrigger value="contas">Contas a Pagar (Boletos)</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="fretes">Fretes</TabsTrigger>
        </TabsList>

        <TabsContent value="entradas">
          <Card className="overflow-hidden p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Origem</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Forma de Pagamento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="w-10">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entradas.map((entrada) => (
                  <TableRow key={`${entrada.tipo}-${entrada.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {entrada.tipo === "os" ? (
                          <Wrench className="size-3.5 text-muted-foreground" />
                        ) : (
                          <ShoppingCart className="size-3.5 text-muted-foreground" />
                        )}
                        {entrada.origemHref ? (
                          <Link href={entrada.origemHref} className="font-medium text-primary">
                            {entrada.origemLabel}
                          </Link>
                        ) : (
                          <span className="font-medium text-foreground">{entrada.origemLabel}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">{entrada.cliente}</TableCell>
                    <TableCell className="text-muted-foreground">{entrada.data ? formatDate(entrada.data) : "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{entrada.formaPagamento}</TableCell>
                    <TableCell className="font-medium text-success">{formatCurrency(entrada.valor)}</TableCell>
                    <TableCell>
                      <ExcluirEntradaButton id={entrada.id} tipo={entrada.tipo} origemLabel={entrada.origemLabel} />
                    </TableCell>
                  </TableRow>
                ))}
                {entradas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      Nenhuma entrada registrada ainda. Elas aparecem aqui quando uma OS é finalizada com pagamento ou
                      uma venda é feita no PDV.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="contas">
          <div className="mb-3 flex justify-end gap-2">
            <ExportarCsvButton tipo="contas" />
            <NovaContaDialog />
          </div>
          <Card className="overflow-hidden p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(contas ?? []).map((conta) => {
                  const atrasado = conta.status !== "pago" && conta.vencimento < hojeStr;
                  const statusInfo = contaStatusMap[(atrasado ? "atrasado" : conta.status) as ContaStatus];
                  return (
                    <TableRow key={conta.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{conta.descricao}</p>
                          {conta.parcela_total && (
                            <Badge variant="secondary">
                              {conta.parcela_atual}/{conta.parcela_total}
                            </Badge>
                          )}
                        </div>
                        {conta.fornecedor && <p className="text-xs text-muted-foreground">{conta.fornecedor}</p>}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{conta.categoria || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(conta.vencimento)}</TableCell>
                      <TableCell className="font-medium text-foreground">{formatCurrency(conta.valor)}</TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {conta.status !== "pago" && <MarcarPagoButton id={conta.id} />}
                          <ExcluirContaButton id={conta.id} descricao={conta.descricao} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(contas ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      Nenhuma conta cadastrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="despesas">
          <div className="mb-3 flex justify-end">
            <ExportarCsvButton tipo="despesas" />
          </div>
          <Card className="overflow-hidden p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="w-10">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(despesas ?? []).map((despesa) => (
                  <TableRow key={despesa.id}>
                    <TableCell className="font-medium text-foreground">{despesa.descricao}</TableCell>
                    <TableCell className="text-muted-foreground">{despesa.categoria || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(despesa.data)}</TableCell>
                    <TableCell className="font-medium text-foreground">{formatCurrency(despesa.valor)}</TableCell>
                    <TableCell>
                      <ExcluirDespesaButton id={despesa.id} descricao={despesa.descricao} />
                    </TableCell>
                  </TableRow>
                ))}
                {(despesas ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      Nenhuma despesa lançada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="fretes">
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatCard icon={AlertTriangle} label="Pendente de pagamento" value={formatCurrency(totalFretePendente)} tone="danger" />
            <StatCard icon={Truck} label="Pago este mês" value={formatCurrency(totalFretePagoNoMes)} />
          </div>
          <Card className="overflow-hidden p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>OS</TableHead>
                  <TableHead>Prestador</TableHead>
                  <TableHead>Cobrado do cliente</TableHead>
                  <TableHead>Pago ao prestador</TableHead>
                  <TableHead>Margem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(fretes ?? []).map((frete) => {
                  const statusInfo = freteStatusMap[frete.status];
                  const cobrado = frete.ordens_servico?.valor_frete ?? 0;
                  const margem = cobrado - frete.valor_custo;
                  return (
                    <TableRow key={frete.id}>
                      <TableCell className="font-semibold text-primary">
                        {frete.ordens_servico && (
                          <Link href={`/ordens-servico/${frete.os_id}`}>
                            #OS-{String(frete.ordens_servico.numero).padStart(4, "0")}
                          </Link>
                        )}
                      </TableCell>
                      <TableCell className="text-foreground">{frete.prestadores_frete?.nome ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{formatCurrency(cobrado)}</TableCell>
                      <TableCell className="font-medium text-foreground">{formatCurrency(frete.valor_custo)}</TableCell>
                      <TableCell className={margem >= 0 ? "text-success" : "text-destructive"}>
                        {formatCurrency(margem)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {frete.status === "pendente" && <MarcarFretePagoButton freteId={frete.id} osId={frete.os_id} />}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(fretes ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      Nenhum frete registrado ainda. Eles aparecem aqui quando você define a origem &quot;Frete&quot;
                      numa OS.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
