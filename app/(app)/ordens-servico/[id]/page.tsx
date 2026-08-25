import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Wrench, MessageSquareText, RotateCcw, Truck, Package, Zap, Calculator } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OsStepIndicator } from "@/components/os/os-step-indicator";
import { OsItensList } from "@/components/os/os-itens-list";
import { OsResumoValores } from "@/components/os/os-resumo-valores";
import { OsAcoes } from "@/components/os/os-acoes";
import { OsParadaToggle } from "@/components/os/os-parada-toggle";
import { FreteCard } from "@/components/os/frete-card";
import { OsRetiradaCard } from "@/components/os/os-retirada-card";
import { formatDateTime } from "@/lib/utils";
import { urgenciaMap } from "@/lib/status";
import type { OrdemServico, OsStatus, OsUrgencia } from "@/types";

export const dynamic = "force-dynamic";

interface OsDetalheRow extends OrdemServico {
  clientes: { id: string; nome: string; telefone: string | null; email: string | null } | null;
  equipamentos: { id: string; tipo: string; marca: string | null; modelo: string | null; numero_serie: string | null } | null;
}

export default async function OrdemServicoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [{ data: os }, { data: itens }, { data: pecas }, { data: frete }, { data: prestadores }, { data: lojas }] =
    await Promise.all([
      supabase
        .from("ordens_servico")
        .select<string, OsDetalheRow>(
          "*, clientes(id, nome, telefone, email), equipamentos(id, tipo, marca, modelo, numero_serie)"
        )
        .eq("id", id)
        .maybeSingle(),
      supabase.from("os_itens").select("*").eq("os_id", id).order("created_at", { ascending: true }),
      supabase.from("pecas").select("*").order("nome", { ascending: true }),
      supabase.from("fretes").select("*").eq("os_id", id).maybeSingle(),
      supabase.from("prestadores_frete").select("*").order("nome", { ascending: true }),
      supabase.from("lojas_parceiras").select("*").order("nome", { ascending: true }),
    ]);

  if (!os) notFound();

  const cliente = Array.isArray(os.clientes) ? os.clientes[0] : os.clientes;
  const equipamento = Array.isArray(os.equipamentos) ? os.equipamentos[0] : os.equipamentos;
  const totalPecas = (itens ?? []).reduce((acc, i) => acc + i.quantidade * i.valor_unitario, 0);
  const total = totalPecas + os.valor_mao_obra + os.valor_frete - os.desconto;
  const urgencia = urgenciaMap[os.urgencia as OsUrgencia];

  return (
    <div>
      <Link href="/ordens-servico" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Voltar para Ordens de Serviço
      </Link>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold text-foreground md:text-2xl">
          OS #{String(os.numero).padStart(4, "0")}
        </h1>
        <span className={`inline-block size-2.5 rounded-full ${urgencia.dotClass}`} />
        <span className="text-sm text-muted-foreground">{urgencia.label}</span>
      </div>

      <Card className="mb-5 p-4 md:p-5">
        <OsStepIndicator osId={os.id} status={os.status as OsStatus} />
      </Card>

      {os.status !== "finalizado" && os.status !== "cancelado" && os.data_finalizacao && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-warning/30 bg-warning/5 p-4">
          <RotateCcw className="size-4.5 shrink-0 text-warning" />
          <p className="text-sm text-warning">
            Esta OS foi reaberta — o pagamento anterior foi removido. Finalize novamente quando o pagamento for
            confirmado.
          </p>
        </div>
      )}

      <div className="mb-5">
        <OsParadaToggle osId={os.id} parada={os.parada} motivo={os.parada_motivo} />
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
              <Info label="Nome" value={cliente?.nome} />
              <Info label="Telefone" value={cliente?.telefone} />
              <Info label="E-mail" value={cliente?.email} />
              <Info label="Entrada" value={formatDateTime(os.data_entrada)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="size-4.5 text-primary" />
                Dados do Equipamento
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Info label="Tipo" value={equipamento?.tipo} />
              <Info label="Marca" value={equipamento?.marca} />
              <Info label="Modelo" value={equipamento?.modelo} />
              <Info label="Número de série" value={equipamento?.numero_serie} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareText className="size-4.5 text-primary" />
                Relato do Problema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{os.problema_relatado || "Nenhum relato informado."}</p>
              {os.diagnostico && (
                <div className="mt-3 rounded-lg bg-secondary p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Diagnóstico</p>
                  <p className="mt-1 text-sm text-foreground">{os.diagnostico}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="size-4.5 text-primary" />
                Peças e Serviços
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OsItensList osId={os.id} itens={itens ?? []} pecas={pecas ?? []} lojas={lojas ?? []} />
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
              <OsAcoes
                osId={os.id}
                status={os.status as OsStatus}
                numero={os.numero}
                clienteNome={cliente?.nome ?? "cliente"}
                clienteTelefone={cliente?.telefone ?? null}
                total={total}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="size-4.5 text-primary" />
                Resumo de Valores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OsResumoValores os={os} totalPecas={totalPecas} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="size-4.5 text-primary" />
                Custo do Frete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FreteCard osId={os.id} frete={frete ?? null} prestadoresIniciais={prestadores ?? []} valorCobrado={os.valor_frete} />
            </CardContent>
          </Card>

          {os.status === "finalizado" && (
            <OsRetiradaCard
              key={os.data_retirada ?? "sem-retirada"}
              osId={os.id}
              garantiaDias={os.garantia_dias}
              dataRetirada={os.data_retirada}
            />
          )}
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
