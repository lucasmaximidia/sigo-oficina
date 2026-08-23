import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RestaurarButton } from "@/components/configuracoes/restaurar-button";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LixeiraPage() {
  const [{ data: contas }, { data: despesas }, { data: vendas }] = await Promise.all([
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
  ]);

  const vazia = (contas ?? []).length === 0 && (despesas ?? []).length === 0 && (vendas ?? []).length === 0;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/configuracoes" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Voltar para Configurações
      </Link>
      <PageHeader
        title="Lixeira"
        description="Contas, despesas e vendas excluídas ficam aqui e podem ser restauradas."
      />

      {vazia && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <Trash2 className="size-6" />
            <p className="text-sm">A lixeira está vazia.</p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-5">
        {(contas ?? []).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Contas a Pagar</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {(contas ?? []).map((conta) => (
                <div key={conta.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{conta.descricao}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(conta.valor)} · Excluído em {formatDateTime(conta.deletado_em!)}
                    </p>
                  </div>
                  <RestaurarButton id={conta.id} tipo="conta" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {(despesas ?? []).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Despesas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {(despesas ?? []).map((despesa) => (
                <div key={despesa.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{despesa.descricao}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(despesa.valor)} · Excluído em {formatDateTime(despesa.deletado_em!)}
                    </p>
                  </div>
                  <RestaurarButton id={despesa.id} tipo="despesa" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {(vendas ?? []).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Vendas do PDV</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {(vendas ?? []).map((venda) => (
                <div key={venda.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">Venda #{String(venda.numero).padStart(5, "0")}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(venda.total)} · Excluído em {formatDateTime(venda.deletado_em!)}
                    </p>
                  </div>
                  <RestaurarButton id={venda.id} tipo="venda" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
