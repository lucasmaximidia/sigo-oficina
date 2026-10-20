import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { dataLembreteVencimento, formatCurrency } from "@/lib/utils";
import { enviarPushParaTodos } from "@/lib/push";

export const dynamic = "force-dynamic";

const formatarHora = (iso: string) => new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

async function avisarContasAVencer(
  supabase: ReturnType<typeof createServiceClient>,
  ativo: boolean,
  dias: number
) {
  if (!ativo) return;

  const hoje = new Date();
  const hojeStr = hoje.toISOString().slice(0, 10);
  const limiteLembreteStr = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + dias).toISOString().slice(0, 10);

  const [{ data: contasVencendo }, { data: contasParaLembrete }] = await Promise.all([
    supabase
      .from("financeiro_contas")
      .select("id, descricao, vencimento, valor")
      .neq("status", "pago")
      .lte("vencimento", hojeStr),
    supabase
      .from("financeiro_contas")
      .select("id, descricao, vencimento, valor")
      .neq("status", "pago")
      .gte("vencimento", hojeStr)
      .lte("vencimento", limiteLembreteStr),
  ]);

  const vencidas = contasVencendo ?? [];
  const lembreteHoje = (contasParaLembrete ?? []).filter((conta) => dataLembreteVencimento(conta.vencimento) === hojeStr);
  if (vencidas.length === 0 && lembreteHoje.length === 0) return;

  let title: string;
  let body: string;
  if (vencidas.length > 0) {
    const total = vencidas.reduce((acc, c) => acc + c.valor, 0);
    title = vencidas.length === 1 ? "1 conta vencida ou vencendo hoje" : `${vencidas.length} contas vencidas ou vencendo hoje`;
    body = `Total de ${formatCurrency(total)} em aberto.`;
  } else {
    const total = lembreteHoje.reduce((acc, c) => acc + c.valor, 0);
    title = lembreteHoje.length === 1 ? "1 conta vence em breve" : `${lembreteHoje.length} contas vencem em breve`;
    body = `Total de ${formatCurrency(total)} a pagar nos próximos dias.`;
  }

  await enviarPushParaTodos({ title, body, url: "/financeiro" });
}

async function avisarAgendaDoDia(supabase: ReturnType<typeof createServiceClient>, ativo: boolean) {
  if (!ativo) return;

  const hoje = new Date();
  const hojeStr = hoje.toISOString().slice(0, 10);
  const amanhaStr = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1).toISOString().slice(0, 10);

  const { data: eventos } = await supabase
    .from("agenda_eventos")
    .select("id, titulo, data_hora_inicio")
    .gte("data_hora_inicio", `${hojeStr}T00:00:00`)
    .lt("data_hora_inicio", `${amanhaStr}T00:00:00`)
    .not("status", "in", "(concluido,cancelado)")
    .order("data_hora_inicio", { ascending: true });

  if (!eventos || eventos.length === 0) return;

  const title = eventos.length === 1 ? "1 agendamento hoje" : `${eventos.length} agendamentos hoje`;
  const body =
    eventos.length === 1
      ? `${formatarHora(eventos[0].data_hora_inicio)} — ${eventos[0].titulo}`
      : `Primeiro às ${formatarHora(eventos[0].data_hora_inicio)}: ${eventos[0].titulo}.`;

  await enviarPushParaTodos({ title, body, url: "/agenda" });
}

async function avisarDevolucoesLocacao(supabase: ReturnType<typeof createServiceClient>, ativo: boolean) {
  if (!ativo) return;

  const hoje = new Date();
  const hojeStr = hoje.toISOString().slice(0, 10);
  const amanhaStr = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1).toISOString().slice(0, 10);

  const { data: alugueis } = await supabase
    .from("locacao_alugueis")
    .select("id, data_prevista_devolucao, locacao_veiculos(marca, modelo), locacao_clientes(nome)")
    .is("data_devolucao_real", null)
    .gte("data_prevista_devolucao", `${hojeStr}T00:00:00`)
    .lt("data_prevista_devolucao", `${amanhaStr}T00:00:00`)
    .order("data_prevista_devolucao", { ascending: true });

  if (!alugueis || alugueis.length === 0) return;

  const primeiro = alugueis[0];
  const veiculo = primeiro.locacao_veiculos as unknown as { marca: string; modelo: string } | null;
  const cliente = primeiro.locacao_clientes as unknown as { nome: string } | null;

  const title = alugueis.length === 1 ? "1 devolução de locação hoje" : `${alugueis.length} devoluções de locação hoje`;
  const body =
    alugueis.length === 1
      ? `${formatarHora(primeiro.data_prevista_devolucao)} — ${veiculo?.marca ?? ""} ${veiculo?.modelo ?? ""} (${cliente?.nome ?? "cliente"})`
      : `Primeira às ${formatarHora(primeiro.data_prevista_devolucao)}: ${veiculo?.marca ?? ""} ${veiculo?.modelo ?? ""}.`;

  await enviarPushParaTodos({ title, body, url: "/locacao/alugueis" });
}

// Disparado 1x/dia pelo Vercel Cron (ver vercel.json). Reproduz a mesma
// regra do sino de notificações/toast do app (app/(app)/layout.tsx) e da
// agenda do dashboard, mas via push — para avisar mesmo com o app fechado.
// O Vercel assina a requisição com `Authorization: Bearer $CRON_SECRET`
// automaticamente quando essa variável está configurada no projeto; sem ela
// configurada, a rota rejeita qualquer chamada (fail closed) em vez de
// ficar aberta.
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: config } = await supabase
    .from("configuracoes")
    .select("push_contas_vencer_ativo, push_contas_vencer_dias, push_agenda_hoje_ativo, push_locacao_devolucao_ativo")
    .eq("id", 1)
    .single();

  await Promise.all([
    avisarContasAVencer(supabase, config?.push_contas_vencer_ativo ?? false, config?.push_contas_vencer_dias ?? 2),
    avisarAgendaDoDia(supabase, config?.push_agenda_hoje_ativo ?? false),
    avisarDevolucoesLocacao(supabase, config?.push_locacao_devolucao_ativo ?? false),
  ]);

  return NextResponse.json({ enviado: true });
}
