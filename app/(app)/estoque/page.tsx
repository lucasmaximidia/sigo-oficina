import { AlertTriangle, Store, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PecaDialog } from "@/components/estoque/peca-dialog";
import { LojaDialog } from "@/components/estoque/loja-dialog";
import { EntradaEstoqueDialog } from "@/components/estoque/entrada-estoque-dialog";
import { ExportarCsvButton } from "@/components/ui/exportar-csv-button";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface EntradaRecenteRow {
  id: string;
  numero_nf: string | null;
  data_nf: string;
  valor_total: number;
  lojas_parceiras: { nome: string } | null;
}

export default async function EstoquePage() {
  const [{ data: pecas }, { data: lojas }, { data: entradas }] = await Promise.all([
    supabase.from("pecas").select("*").order("nome", { ascending: true }),
    supabase.from("lojas_parceiras").select("*").order("principal", { ascending: false }),
    supabase
      .from("entradas_estoque")
      .select<string, EntradaRecenteRow>("id, numero_nf, data_nf, valor_total, lojas_parceiras(nome)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const criticas = (pecas ?? []).filter((p) => p.quantidade === 0);
  const baixas = (pecas ?? []).filter((p) => p.quantidade > 0 && p.quantidade <= p.quantidade_minima);

  function statusPeca(quantidade: number, minimo: number) {
    if (quantidade === 0) return { label: "Crítico", variant: "destructive" as const };
    if (quantidade <= minimo) return { label: "Baixo", variant: "warning" as const };
    return { label: "Adequado", variant: "success" as const };
  }

  return (
    <div>
      <PageHeader
        title="Controle de Estoque"
        description="Gerencie peças, ferramentas e visualize parceiros."
        actions={
          <>
            <ExportarCsvButton tipo="estoque" />
            <EntradaEstoqueDialog lojas={lojas ?? []} pecas={pecas ?? []} />
            <PecaDialog lojas={lojas ?? []} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="overflow-hidden p-0 lg:col-span-2">
          <CardHeader>
            <CardTitle>Inventário Atual</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item / Código</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Custo / Venda</TableHead>
                <TableHead>Lucro Unitário</TableHead>
                <TableHead className="w-10">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(pecas ?? []).map((peca) => {
                const status = statusPeca(peca.quantidade, peca.quantidade_minima);
                const lucroUnitario = peca.preco_venda - peca.preco_custo;
                const margem = peca.preco_venda > 0 ? (lucroUnitario / peca.preco_venda) * 100 : 0;
                return (
                  <TableRow key={peca.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">{peca.nome}</p>
                      {peca.codigo && <p className="text-xs text-muted-foreground">COD: {peca.codigo}</p>}
                    </TableCell>
                    <TableCell>
                      <p className="text-foreground">{peca.quantidade} unid.</p>
                      <Badge variant={status.variant} className="mt-1">
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground">Custo: {formatCurrency(peca.preco_custo)}</p>
                      <p className="text-foreground">Venda: {formatCurrency(peca.preco_venda)}</p>
                    </TableCell>
                    <TableCell>
                      <p className={cn("font-medium", lucroUnitario >= 0 ? "text-success" : "text-destructive")}>
                        {formatCurrency(lucroUnitario)}
                      </p>
                      <p className="text-xs text-muted-foreground">{margem.toFixed(0)}% de margem</p>
                    </TableCell>
                    <TableCell>
                      <PecaDialog peca={peca} lojas={lojas ?? []} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {(pecas ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    Nenhuma peça cadastrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        <div className="flex flex-col gap-5">
          {(criticas.length > 0 || baixas.length > 0) && (
            <Card className={cn("border-destructive/30 bg-destructive/5")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="size-4.5" />
                  Atenção Necessária
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm text-destructive">
                  Você possui {criticas.length + baixas.length} {criticas.length + baixas.length === 1 ? "item" : "itens"} com
                  estoque crítico ou baixo que precisam ser repostos para não atrasar as OS ativas.
                </p>
                <Button variant="destructive" className="w-full">
                  Gerar Pedido de Compra
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Store className="size-4.5 text-primary" />
                Lojas Parceiras
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {(lojas ?? []).map((loja) => (
                <div key={loja.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{loja.nome}</p>
                    {loja.principal && <Badge variant="success">Principal</Badge>}
                  </div>
                  {loja.especialidade && <p className="text-xs text-muted-foreground">{loja.especialidade}</p>}
                  {loja.tempo_entrega && <p className="mt-1 text-xs text-muted-foreground">{loja.tempo_entrega}</p>}
                </div>
              ))}
              {(lojas ?? []).length === 0 && <p className="text-sm text-muted-foreground">Nenhuma loja cadastrada.</p>}
              <LojaDialog />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-4.5 text-primary" />
                Últimas Entradas (NF)
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {(entradas ?? []).map((entrada) => (
                <div key={entrada.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">
                      NF {entrada.numero_nf ?? "s/ nº"}
                    </p>
                    <p className="text-sm font-medium text-foreground">{formatCurrency(entrada.valor_total)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {entrada.lojas_parceiras?.nome ?? "Sem loja"} · {formatDate(entrada.data_nf)}
                  </p>
                </div>
              ))}
              {(entradas ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma entrada de mercadoria registrada ainda.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
