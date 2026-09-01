import Link from "next/link";
import { ArrowLeft, Trash2, Wallet2, Receipt, ShoppingCart, HandCoins, PiggyBank } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RestaurarButton } from "@/components/configuracoes/restaurar-button";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LixeiraPage() {
  const [{ data: contas }, { data: despesas }, { data: vendas }, { data: retiradas }, { data: ajustes }] = await Promise.all([
    supabase
      .from("financeiro_contas")
      .select("id, descricao, valor, deletado_em")
      .not("deletado_em", "is", null)
      .order("deletado_em", { ascending: false }),
    supabase
      .from("financeiro_despesas")
      .select("id, descricao, valor, deletado_em")
      .not("deletado_em", "is", null)
      .order("deletado_em", { ascending: false }),
    supabase
      .from("vendas_pdv")
      .select("id, numero, total, deletado_em")
      .not("deletado_em", "is", null)
      .order("deletado_em", { ascending: false }),
    supabase
      .from("financeiro_retiradas")
      .select("id, descricao, valor, deletado_em")
      .not("deletado_em", "is", null)
      .order("deletado_em", { ascending: false }),
    supabase
      .from("financeiro_ajustes_caixa")
      .select("id, descricao, valor, deletado_em")
      .not("deletado_em", "is", null)
      .order("deletado_em", { ascending: false }),
  ]);

  const vazia =
    (contas ?? []).length === 0 &&
    (despesas ?? []).length === 0 &&
    (vendas ?? []).length === 0 &&
    (retiradas ?? []).length === 0 &&
    (ajustes ?? []).length === 0;

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/configuracoes" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Voltar para Configurações
      </Link>
      <PageHeader
        title="Lixeira"
        description="Contas, despesas, vendas, retiradas e ajustes de caixa excluídos ficam aqui e podem ser restaurados."
      />

      {vazia && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <Trash2 className="size-6" />
            <p className="text-sm">A lixeira está vazia.</p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-6">
        {(contas ?? []).length > 0 && (
          <div>
            <p className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Wallet2 className="size-4 text-primary" />
              Contas a Pagar
            </p>
            <Card className="overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Excluído em</TableHead>
                    <TableHead className="w-10">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(contas ?? []).map((conta) => (
                    <TableRow key={conta.id}>
                      <TableCell className="font-medium text-foreground">{conta.descricao}</TableCell>
                      <TableCell className="text-muted-foreground">{formatCurrency(conta.valor)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDateTime(conta.deletado_em!)}</TableCell>
                      <TableCell>
                        <RestaurarButton id={conta.id} tipo="conta" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {(despesas ?? []).length > 0 && (
          <div>
            <p className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Receipt className="size-4 text-primary" />
              Despesas
            </p>
            <Card className="overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Excluído em</TableHead>
                    <TableHead className="w-10">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(despesas ?? []).map((despesa) => (
                    <TableRow key={despesa.id}>
                      <TableCell className="font-medium text-foreground">{despesa.descricao}</TableCell>
                      <TableCell className="text-muted-foreground">{formatCurrency(despesa.valor)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDateTime(despesa.deletado_em!)}</TableCell>
                      <TableCell>
                        <RestaurarButton id={despesa.id} tipo="despesa" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {(retiradas ?? []).length > 0 && (
          <div>
            <p className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-foreground">
              <HandCoins className="size-4 text-primary" />
              Retiradas
            </p>
            <Card className="overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Excluído em</TableHead>
                    <TableHead className="w-10">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(retiradas ?? []).map((retirada) => (
                    <TableRow key={retirada.id}>
                      <TableCell className="font-medium text-foreground">{retirada.descricao}</TableCell>
                      <TableCell className="text-muted-foreground">{formatCurrency(retirada.valor)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDateTime(retirada.deletado_em!)}</TableCell>
                      <TableCell>
                        <RestaurarButton id={retirada.id} tipo="retirada" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {(ajustes ?? []).length > 0 && (
          <div>
            <p className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-foreground">
              <PiggyBank className="size-4 text-primary" />
              Ajustes de Caixa
            </p>
            <Card className="overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Excluído em</TableHead>
                    <TableHead className="w-10">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(ajustes ?? []).map((ajuste) => (
                    <TableRow key={ajuste.id}>
                      <TableCell className="font-medium text-foreground">{ajuste.descricao}</TableCell>
                      <TableCell className="text-muted-foreground">{formatCurrency(ajuste.valor)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDateTime(ajuste.deletado_em!)}</TableCell>
                      <TableCell>
                        <RestaurarButton id={ajuste.id} tipo="ajuste" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {(vendas ?? []).length > 0 && (
          <div>
            <p className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShoppingCart className="size-4 text-primary" />
              Vendas do PDV
            </p>
            <Card className="overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Venda</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Excluído em</TableHead>
                    <TableHead className="w-10">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(vendas ?? []).map((venda) => (
                    <TableRow key={venda.id}>
                      <TableCell className="font-medium text-foreground">
                        Venda #{String(venda.numero).padStart(5, "0")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatCurrency(venda.total)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDateTime(venda.deletado_em!)}</TableCell>
                      <TableCell>
                        <RestaurarButton id={venda.id} tipo="venda" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
