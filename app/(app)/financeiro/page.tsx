import { AlertTriangle, ClipboardList } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LancarDespesaDialog } from "@/components/financeiro/lancar-despesa-dialog";
import { NovaContaDialog } from "@/components/financeiro/nova-conta-dialog";
import { MarcarPagoButton } from "@/components/financeiro/marcar-pago-button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { contaStatusMap } from "@/lib/status";
import type { ContaStatus } from "@/types";

export const dynamic = "force-dynamic";

export default async function FinanceiroPage() {
  const hoje = new Date();
  const hojeStr = hoje.toISOString().slice(0, 10);
  const em7dias = new Date(hoje);
  em7dias.setDate(em7dias.getDate() + 7);

  const [{ data: contas }, { data: despesas }] = await Promise.all([
    supabase.from("financeiro_contas").select("*").order("vencimento", { ascending: true }),
    supabase.from("financeiro_despesas").select("*").order("data", { ascending: false }),
  ]);

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
        actions={<LancarDespesaDialog />}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
        <StatCard icon={AlertTriangle} label="Vencendo Hoje/Atrasado" value={formatCurrency(totalVencendo)} tone="danger" />
        <StatCard icon={ClipboardList} label="Próximos 7 dias" value={formatCurrency(totalProximos)} />
      </div>

      <Tabs defaultValue="contas" className="mt-5">
        <TabsList>
          <TabsTrigger value="contas">Contas a Pagar (Boletos)</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
        </TabsList>

        <TabsContent value="contas">
          <div className="mb-3 flex justify-end">
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
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(contas ?? []).map((conta) => {
                  const atrasado = conta.status !== "pago" && conta.vencimento < hojeStr;
                  const statusInfo = contaStatusMap[(atrasado ? "atrasado" : conta.status) as ContaStatus];
                  return (
                    <TableRow key={conta.id}>
                      <TableCell>
                        <p className="font-medium text-foreground">{conta.descricao}</p>
                        {conta.fornecedor && <p className="text-xs text-muted-foreground">{conta.fornecedor}</p>}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{conta.categoria || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(conta.vencimento)}</TableCell>
                      <TableCell className="font-medium text-foreground">{formatCurrency(conta.valor)}</TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell>{conta.status !== "pago" && <MarcarPagoButton id={conta.id} />}</TableCell>
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
          <Card className="overflow-hidden p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(despesas ?? []).map((despesa) => (
                  <TableRow key={despesa.id}>
                    <TableCell className="font-medium text-foreground">{despesa.descricao}</TableCell>
                    <TableCell className="text-muted-foreground">{despesa.categoria || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(despesa.data)}</TableCell>
                    <TableCell className="font-medium text-foreground">{formatCurrency(despesa.valor)}</TableCell>
                  </TableRow>
                ))}
                {(despesas ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      Nenhuma despesa lançada.
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
