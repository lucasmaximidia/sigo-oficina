import Link from "next/link";
import { AlertTriangle, History } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { RegistrarPagamentoDialog } from "@/components/locacao/registrar-pagamento-dialog";
import { EditarAluguelDialog } from "@/components/locacao/editar-aluguel-dialog";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import type { LocacaoAluguelPagamento } from "@/types";

export const dynamic = "force-dynamic";

const FILTROS = [
  { value: "todos", label: "Todos" },
  { value: "pendente", label: "Pendentes" },
  { value: "pago", label: "Pagos" },
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
  searchParams: Promise<{ status?: string }>;
}) {
  const supabase = await createClient();
  const { status } = await searchParams;
  const filtro = status === "pendente" || status === "pago" ? status : "todos";

  let query = supabase
    .from("locacao_alugueis")
    .select("*, locacao_veiculos(marca, modelo, chassi), locacao_clientes(nome)")
    .order("data_retirada", { ascending: false });

  if (filtro === "pendente") query = query.neq("status_pagamento", "pago");
  if (filtro === "pago") query = query.eq("status_pagamento", "pago");

  const [{ data: alugueis }, { data: veiculos }, { data: clientes }, { data: pagamentos }] = await Promise.all([
    query,
    supabase.from("locacao_veiculos").select("id, marca, modelo, chassi").order("marca", { ascending: true }),
    supabase.from("locacao_clientes").select("id, nome").order("nome", { ascending: true }),
    supabase.from("locacao_aluguel_pagamentos").select("*").order("data", { ascending: false }),
  ]);

  const pagamentosPorAluguel = new Map<string, LocacaoAluguelPagamento[]>();
  for (const p of pagamentos ?? []) {
    pagamentosPorAluguel.set(p.aluguel_id, [...(pagamentosPorAluguel.get(p.aluguel_id) ?? []), p]);
  }

  return (
    <div>
      <PageHeader title="Aluguéis" description="Histórico completo de locações" />

      <div className="mb-4 inline-flex items-center gap-1 rounded-xl bg-muted p-1">
        {FILTROS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "todos" ? "/locacao/alugueis" : `/locacao/alugueis?status=${f.value}`}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
              filtro === f.value ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

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
