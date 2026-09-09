import Link from "next/link";
import { AlertTriangle, Store, FileText, Boxes, ClipboardCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PecaDialog } from "@/components/estoque/peca-dialog";
import { PecasInventario } from "@/components/estoque/pecas-inventario";
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
  const supabase = await createClient();
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

  return (
    <div>
      <PageHeader
        title="Controle de Estoque"
        description="Gerencie peças, ferramentas e visualize parceiros."
        actions={
          <>
            <ExportarCsvButton tipo="estoque" />
            <Button asChild variant="outline">
              <Link href="/estoque/balanco">
                <ClipboardCheck className="size-4" />
                Balanço de Estoque
              </Link>
            </Button>
            <EntradaEstoqueDialog lojas={lojas ?? []} pecas={pecas ?? []} />
            <PecaDialog lojas={lojas ?? []} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="overflow-hidden p-0 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="size-4.5 text-primary" />
              Inventário Atual
            </CardTitle>
          </CardHeader>
          <PecasInventario pecas={pecas ?? []} lojas={lojas ?? []} />
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
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{loja.nome}</p>
                      {loja.principal && <Badge variant="success">Principal</Badge>}
                    </div>
                    <LojaDialog loja={loja} />
                  </div>
                  {loja.especialidade && <p className="text-xs text-muted-foreground">{loja.especialidade}</p>}
                  {loja.tempo_entrega && <p className="mt-1 text-xs text-muted-foreground">{loja.tempo_entrega}</p>}
                  {loja.cnpj && <p className="mt-1 text-xs text-muted-foreground">CNPJ: {loja.cnpj}</p>}
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
