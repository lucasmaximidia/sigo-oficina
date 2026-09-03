import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, FileText, Package, Zap, Calculator } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrcamentoStatusMenu } from "@/components/orcamentos/orcamento-status-menu";
import { OrcamentoItensList } from "@/components/orcamentos/orcamento-itens-list";
import { OrcamentoResumoForm } from "@/components/orcamentos/orcamento-resumo-form";
import { OrcamentoAcoes } from "@/components/orcamentos/orcamento-acoes";
import { formatDate } from "@/lib/utils";
import type { Orcamento, OrcamentoStatus } from "@/types";

export const dynamic = "force-dynamic";

interface OrcamentoDetalheRow extends Orcamento {
  clientes: { id: string; nome: string; telefone: string | null; email: string | null } | null;
}

export default async function OrcamentoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const [{ data: orcamento }, { data: itens }, { data: pecas }] = await Promise.all([
    supabase
      .from("orcamentos")
      .select<string, OrcamentoDetalheRow>("*, clientes(id, nome, telefone, email)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("orcamento_itens").select("*").eq("orcamento_id", id).order("created_at", { ascending: true }),
    supabase.from("pecas").select("*").order("nome", { ascending: true }),
  ]);

  if (!orcamento) notFound();

  const totalItens = (itens ?? []).reduce((acc, i) => acc + i.quantidade * i.valor_unitario, 0);
  const total = Math.max(0, totalItens - orcamento.desconto);
  const readOnly = orcamento.status === "aprovado" || orcamento.status === "recusado";

  return (
    <div>
      <Link href="/orcamentos" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Voltar para Orçamentos
      </Link>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground md:text-2xl">
          Orçamento #ORC-{String(orcamento.numero).padStart(4, "0")}
        </h1>
        <OrcamentoStatusMenu orcamentoId={orcamento.id} status={orcamento.status as OrcamentoStatus} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-4.5 text-primary" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Info label="Nome" value={orcamento.clientes?.nome} />
              <Info label="Telefone" value={orcamento.clientes?.telefone} />
              <Info label="Criado em" value={formatDate(orcamento.created_at)} />
              <Info label="Válido até" value={formatDate(orcamento.data_validade)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-4.5 text-primary" />
                Descrição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{orcamento.descricao || "Nenhuma descrição informada."}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="size-4.5 text-primary" />
                Itens do Orçamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrcamentoItensList orcamentoId={orcamento.id} itens={itens ?? []} pecas={pecas ?? []} readOnly={readOnly} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="size-4.5 text-primary" />
                Ações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrcamentoAcoes
                orcamentoId={orcamento.id}
                numero={orcamento.numero}
                clienteNome={orcamento.clientes?.nome ?? "cliente"}
                clienteTelefone={orcamento.clientes?.telefone ?? null}
                total={total}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="size-4.5 text-primary" />
                Resumo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrcamentoResumoForm orcamento={orcamento} totalItens={totalItens} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm text-foreground">{value || "—"}</p>
    </div>
  );
}
