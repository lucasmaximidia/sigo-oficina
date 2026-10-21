import Link from "next/link";
import { AlertTriangle, FileText, History } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { RegistrarPagamentoDialog } from "@/components/locacao/registrar-pagamento-dialog";
import { EditarAluguelDialog } from "@/components/locacao/editar-aluguel-dialog";
import { cn, formatCurrency, formatDate, formatDateTime, diasAPartirDe, hojeBR } from "@/lib/utils";
import type { LocacaoAluguelPagamento } from "@/types";

export const dynamic = "force-dynamic";

const FILTROS = [
  { value: "todos", label: "Todos" },
  { value: "pendente", label: "Pendentes" },
  { value: "pago", label: "Pagos" },
] as const;

// Aluguéis em aberto sempre aparecem, não importa a antiguidade — só os já
// encerrados são afetados pelo período, pra limitar quanto histórico a
// página carrega de uma vez (ver PR de performance).
const PERIODOS = [
  { value: "3m", label: "3 meses", dias: 90 },
  { value: "6m", label: "6 meses", dias: 180 },
  { value: "12m", label: "12 meses", dias: 365 },
  { value: "tudo", label: "Tudo", dias: null },
] as const;

const FORMA_LABEL: Record<string, string> = {
  pix: "PIX",
  cartao: "Cartão",
  dinheiro: "Dinheiro",
  transferencia: "Transferência",
};

export default async function LocacaoAlugueisPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; periodo?: string }>;
}) {
  const supabase = await createClient();
  const { status, periodo } = await searchParams;
  const filtro = status === "pendente" || status === "pago" ? status : "todos";
  const periodoAtivo = PERIODOS.find((p) => p.value === periodo)?.value ?? "3m";
  const dias = PERIODOS.find((p) => p.value === periodoAtivo)!.dias;
  const desdeStr = dias != null ? diasAPartirDe(hojeBR(), -dias) : null;

  let query = supabase
    .from("locacao_alugueis")
    .select("*, locacao_veiculos(marca, modelo, chassi), locacao_clientes(nome)")
    .order("data_retirada", { ascending: false });

  if (filtro === "pendente") query = query.neq("status_pagamento", "pago");
  if (filtro === "pago") query = query.eq("status_pagamento", "pago");
  if (desdeStr) query = query.or(`data_devolucao_real.is.null,data_retirada.gte.${desdeStr}`);

  const [{ data: alugueis }, { data: veiculos }, { data: clientes }] = await Promise.all([
    query,
    supabase.from("locacao_veiculos").select("id, marca, modelo, chassi").order("marca", { ascending: true }),
    supabase.from("locacao_clientes").select("id, nome").order("nome", { ascending: true }),
  ]);

  // Só os pagamentos dos aluguéis que de fato vão aparecer na lista — antes
  // carregava a tabela inteira de pagamentos de todo o histórico.
  const aluguelIds = (alugueis ?? []).map((a) => a.id);
  const { data: pagamentos } = aluguelIds.length
    ? await supabase.from("locacao_aluguel_pagamentos").select("*").in("aluguel_id", aluguelIds).order("data", { ascending: false })
    : { data: [] as LocacaoAluguelPagamento[] };

  const pagamentosPorAluguel = new Map<string, LocacaoAluguelPagamento[]>();
  for (const p of pagamentos ?? []) {
    pagamentosPorAluguel.set(p.aluguel_id, [...(pagamentosPorAluguel.get(p.aluguel_id) ?? []), p]);
  }

  return (
    <div>
      <PageHeader title="Aluguéis" description="Histórico completo de locações" />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-1 rounded-xl bg-muted p-1">
          {FILTROS.map((f) => (
            <Link
              key={f.value}
              href={{
                pathname: "/locacao/alugueis",
                query: { ...(f.value !== "todos" && { status: f.value }), ...(periodoAtivo !== "3m" && { periodo: periodoAtivo }) },
              }}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
                filtro === f.value ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>
        <div className="inline-flex items-center gap-1 rounded-xl bg-muted p-1">
          {PERIODOS.map((p) => (
            <Link
              key={p.value}
              href={{
                pathname: "/locacao/alugueis",
                query: { ...(filtro !== "todos" && { status: filtro }), ...(p.value !== "3m" && { periodo: p.value }) },
              }}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
                periodoAtivo === p.value ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>
      {desdeStr && (
        <p className="-mt-2 mb-4 text-xs text-muted-foreground">
          Mostrando encerrados desde {formatDate(desdeStr)} · aluguéis em aberto sempre aparecem.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {(alugueis ?? []).map((a) => {
          const veiculo = a.locacao_veiculos as unknown as { marca: string; modelo: string; chassi: string } | null;
          const cliente = a.locacao_clientes as unknown as { nome: string } | null;
          const aberto = !a.data_devolucao_real;
          const atrasado = aberto && new Date(a.data_prevista_devolucao) < new Date();

          return (
            <Card key={a.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    #{String(a.numero).padStart(4, "0")}
                  </span>
                  <span className="text-sm text-foreground">{cliente?.nome ?? "Cliente"}</span>
                  <Badge variant={aberto ? "info" : "secondary"}>{aberto ? "Em aberto" : "Encerrado"}</Badge>
                  {atrasado && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="size-3" />
                      Atrasado
                    </Badge>
                  )}
                  <Badge
                    variant={a.status_pagamento === "pago" ? "success" : a.status_pagamento === "parcial" ? "warning" : "secondary"}
                  >
                    {a.status_pagamento === "pago" ? "Pago" : a.status_pagamento === "parcial" ? "Parcial" : "Pendente"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {veiculo ? `${veiculo.marca} ${veiculo.modelo} · ${veiculo.chassi}` : "Veículo"} · Retirada{" "}
                  {formatDateTime(a.data_retirada)} · Devolução{" "}
                  {a.data_devolucao_real
                    ? formatDateTime(a.data_devolucao_real)
                    : `prevista ${formatDateTime(a.data_prevista_devolucao)}`}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {FORMA_LABEL[a.forma_pagamento] ?? a.forma_pagamento}
                  {a.km_inicio != null &&
                    ` · ${a.km_fim != null ? `${a.km_fim - a.km_inicio} km rodados (${a.km_inicio} → ${a.km_fim})` : `saiu com ${a.km_inicio} km`}`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-foreground">{formatCurrency(a.valor)}</p>
                <Button type="button" variant="outline" size="icon" asChild title="Ver contrato em PDF">
                  <a href={`/api/locacao/${a.id}/contrato`} target="_blank" rel="noopener noreferrer">
                    <FileText className="size-4" />
                  </a>
                </Button>
                {a.status_pagamento !== "pago" && (
                  <RegistrarPagamentoDialog
                    aluguelId={a.id}
                    valorTotal={a.valor}
                    pagamentos={pagamentosPorAluguel.get(a.id) ?? []}
                  />
                )}
                <EditarAluguelDialog aluguel={a} veiculos={veiculos ?? []} clientes={clientes ?? []} />
              </div>
            </Card>
          );
        })}
      </div>

      {(alugueis ?? []).length === 0 && (
        <EmptyState icon={<History className="size-5" />} title="Nenhum aluguel encontrado" />
      )}
    </div>
  );
}
