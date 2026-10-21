import { createServiceClient } from "@/lib/supabase/service";
import { dataLembreteVencimento, diasAPartirDe, formatCurrency, hojeBR, horaBR, inicioDiaBR } from "@/lib/utils";
import { enviarPushParaTodos } from "@/lib/push";
import type { Configuracao } from "@/types";

type Supabase = ReturnType<typeof createServiceClient>;

type ConfigAvisos = Pick<
  Configuracao,
  | "push_contas_vencer_ativo"
  | "push_contas_vencer_dias"
  | "push_contas_vencer_horario"
  | "push_contas_vencer_ultimo_envio"
  | "push_agenda_hoje_ativo"
  | "push_agenda_hoje_horario"
  | "push_agenda_hoje_ultimo_envio"
  | "push_locacao_devolucao_ativo"
  | "push_locacao_devolucao_dias"
  | "push_locacao_devolucao_horario"
  | "push_locacao_devolucao_ultimo_envio"
>;

type ColunaUltimoEnvio =
  | "push_contas_vencer_ultimo_envio"
  | "push_agenda_hoje_ultimo_envio"
  | "push_locacao_devolucao_ultimo_envio";

type ColunaUltimoResultado =
  | "push_contas_vencer_ultimo_resultado"
  | "push_agenda_hoje_ultimo_resultado"
  | "push_locacao_devolucao_ultimo_resultado";

const formatarHora = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }).format(new Date(iso));

// Já passou do horário configurado e ainda não rodou hoje? Comparação de
// string funciona porque os dois lados são sempre "HH:mm" com zero à
// esquerda.
function deveRodarAgora(ativo: boolean, horario: string, ultimoEnvio: string | null, hojeStr: string, horaAtual: string) {
  return ativo && ultimoEnvio !== hojeStr && horaAtual >= horario.slice(0, 5);
}

async function marcarRodadoHoje(supabase: Supabase, coluna: ColunaUltimoEnvio, hojeStr: string) {
  const update =
    coluna === "push_contas_vencer_ultimo_envio"
      ? { push_contas_vencer_ultimo_envio: hojeStr }
      : coluna === "push_agenda_hoje_ultimo_envio"
        ? { push_agenda_hoje_ultimo_envio: hojeStr }
        : { push_locacao_devolucao_ultimo_envio: hojeStr };
  await supabase.from("configuracoes").update(update).eq("id", 1);
}

// Guarda o resultado real do disparo (enviado, nada a notificar, ou erro) —
// antes disso não tinha como saber, sem olhar log de servidor, se um aviso
// realmente chegou a algum dispositivo ou só "rodou" sem efeito nenhum.
async function registrarResultado(supabase: Supabase, coluna: ColunaUltimoResultado, resultado: string) {
  const update =
    coluna === "push_contas_vencer_ultimo_resultado"
      ? { push_contas_vencer_ultimo_resultado: resultado }
      : coluna === "push_agenda_hoje_ultimo_resultado"
        ? { push_agenda_hoje_ultimo_resultado: resultado }
        : { push_locacao_devolucao_ultimo_resultado: resultado };
  await supabase.from("configuracoes").update(update).eq("id", 1);
}

function resultadoEnvio(resultado: Awaited<ReturnType<typeof enviarPushParaTodos>>, descricao: string) {
  if (resultado.semChaves) return "Erro: chaves VAPID não configuradas";
  if (resultado.semDispositivos) return "Nenhum dispositivo cadastrado";
  if (resultado.enviados === 0) return `Erro: falha ao enviar pros ${resultado.falhas} dispositivo(s)`;
  if (resultado.falhas > 0) return `${descricao} (parcial: ${resultado.enviados}/${resultado.enviados + resultado.falhas})`;
  return descricao;
}

async function avisarContasAVencer(supabase: Supabase, dias: number) {
  const hojeStr = hojeBR();
  const limiteLembreteStr = diasAPartirDe(hojeStr, dias);

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
  if (vencidas.length === 0 && lembreteHoje.length === 0) return "Nenhuma conta vencendo";

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

  const resultado = await enviarPushParaTodos({ title, body, url: "/financeiro" });
  return resultadoEnvio(resultado, `Enviado: ${title}`);
}

async function avisarAgendaDoDia(supabase: Supabase) {
  const hojeStr = hojeBR();
  const amanhaStr = diasAPartirDe(hojeStr, 1);

  const { data: eventos } = await supabase
    .from("agenda_eventos")
    .select("id, titulo, data_hora_inicio")
    .gte("data_hora_inicio", inicioDiaBR(hojeStr))
    .lt("data_hora_inicio", inicioDiaBR(amanhaStr))
    .not("status", "in", "(concluido,cancelado)")
    .order("data_hora_inicio", { ascending: true });

  if (!eventos || eventos.length === 0) return "Nenhum agendamento hoje";

  const title = eventos.length === 1 ? "1 agendamento hoje" : `${eventos.length} agendamentos hoje`;
  const body =
    eventos.length === 1
      ? `${formatarHora(eventos[0].data_hora_inicio)} — ${eventos[0].titulo}`
      : `Primeiro às ${formatarHora(eventos[0].data_hora_inicio)}: ${eventos[0].titulo}.`;

  const resultado = await enviarPushParaTodos({ title, body, url: "/agenda" });
  return resultadoEnvio(resultado, `Enviado: ${title}`);
}

async function avisarDevolucoesLocacao(supabase: Supabase, dias: number) {
  const hojeStr = hojeBR();
  const amanhaStr = diasAPartirDe(hojeStr, 1);

  const { data: devolucoesHoje } = await supabase
    .from("locacao_alugueis")
    .select("id, data_prevista_devolucao, locacao_veiculos(marca, modelo), locacao_clientes(nome)")
    .is("data_devolucao_real", null)
    .gte("data_prevista_devolucao", inicioDiaBR(hojeStr))
    .lt("data_prevista_devolucao", inicioDiaBR(amanhaStr))
    .order("data_prevista_devolucao", { ascending: true });

  let devolucoes = devolucoesHoje ?? [];
  let titulo = "devolução";

  // Além de hoje, avisa também as que vencem daqui a N dias (antecedência
  // configurável) — só dispara uma vez: se "hoje" já tem devolução, prioriza
  // o aviso de hoje (mais urgente) e não duplica com o de antecedência no
  // mesmo disparo.
  if (devolucoes.length === 0 && dias > 0) {
    const diaAlvoStr = diasAPartirDe(hojeStr, dias);
    const diaSeguinteStr = diasAPartirDe(diaAlvoStr, 1);
    const { data: devolucoesFuturas } = await supabase
      .from("locacao_alugueis")
      .select("id, data_prevista_devolucao, locacao_veiculos(marca, modelo), locacao_clientes(nome)")
      .is("data_devolucao_real", null)
      .gte("data_prevista_devolucao", inicioDiaBR(diaAlvoStr))
      .lt("data_prevista_devolucao", inicioDiaBR(diaSeguinteStr))
      .order("data_prevista_devolucao", { ascending: true });
    devolucoes = devolucoesFuturas ?? [];
    titulo = "devolução em breve";
  }

  if (devolucoes.length === 0) return "Nenhuma devolução prevista";

  const primeiro = devolucoes[0];
  const veiculo = primeiro.locacao_veiculos as unknown as { marca: string; modelo: string } | null;
  const cliente = primeiro.locacao_clientes as unknown as { nome: string } | null;
  const plural = titulo === "devolução" ? "devoluções" : "devoluções em breve";

  const title = devolucoes.length === 1 ? `1 ${titulo} de locação` : `${devolucoes.length} ${plural} de locação`;
  const body =
    devolucoes.length === 1
      ? `${formatarHora(primeiro.data_prevista_devolucao)} — ${veiculo?.marca ?? ""} ${veiculo?.modelo ?? ""} (${cliente?.nome ?? "cliente"})`
      : `Primeira às ${formatarHora(primeiro.data_prevista_devolucao)}: ${veiculo?.marca ?? ""} ${veiculo?.modelo ?? ""}.`;

  const resultado = await enviarPushParaTodos({ title, body, url: "/locacao/alugueis" });
  return resultadoEnvio(resultado, `Enviado: ${title}`);
}

// Ponto único de disparo dos avisos push diários — chamado tanto pelo cron
// (app/api/cron/notificacoes) quanto ao abrir qualquer página do app
// (app/(app)/layout.tsx). Cada tipo de aviso só roda uma vez por dia, no seu
// próprio horário configurado em Configurações: a 1ª chamada que acontecer
// depois do horário (seja o cron ou alguém abrindo o app) dispara e marca
// como feito; as demais no mesmo dia não repetem.
//
// Isso existe porque o Vercel Cron do plano gratuito não é confiável o
// bastante sozinho (não disparou contas vencendo mesmo com tudo configurado
// certo) — abrir o app todo dia de trabalho vira o gatilho de verdade, e o
// cron continua rodando como reforço, sem risco de duplicar.
export async function processarNotificacoesDiarias() {
  const supabase = createServiceClient();
  const hojeStr = hojeBR();
  const horaAtual = horaBR();

  const { data: config } = await supabase
    .from("configuracoes")
    .select(
      "push_contas_vencer_ativo, push_contas_vencer_dias, push_contas_vencer_horario, push_contas_vencer_ultimo_envio, push_agenda_hoje_ativo, push_agenda_hoje_horario, push_agenda_hoje_ultimo_envio, push_locacao_devolucao_ativo, push_locacao_devolucao_dias, push_locacao_devolucao_horario, push_locacao_devolucao_ultimo_envio"
    )
    .eq("id", 1)
    .single();
  if (!config) return;
  const c: ConfigAvisos = config;

  const tarefas: Promise<void>[] = [];

  if (deveRodarAgora(c.push_contas_vencer_ativo, c.push_contas_vencer_horario, c.push_contas_vencer_ultimo_envio, hojeStr, horaAtual)) {
    tarefas.push(
      marcarRodadoHoje(supabase, "push_contas_vencer_ultimo_envio", hojeStr)
        .then(() => avisarContasAVencer(supabase, c.push_contas_vencer_dias))
        .then((resultado) => registrarResultado(supabase, "push_contas_vencer_ultimo_resultado", resultado))
        .catch((error) =>
          registrarResultado(
            supabase,
            "push_contas_vencer_ultimo_resultado",
            `Erro: ${error instanceof Error ? error.message : String(error)}`
          )
        )
    );
  }

  if (deveRodarAgora(c.push_agenda_hoje_ativo, c.push_agenda_hoje_horario, c.push_agenda_hoje_ultimo_envio, hojeStr, horaAtual)) {
    tarefas.push(
      marcarRodadoHoje(supabase, "push_agenda_hoje_ultimo_envio", hojeStr)
        .then(() => avisarAgendaDoDia(supabase))
        .then((resultado) => registrarResultado(supabase, "push_agenda_hoje_ultimo_resultado", resultado))
        .catch((error) =>
          registrarResultado(
            supabase,
            "push_agenda_hoje_ultimo_resultado",
            `Erro: ${error instanceof Error ? error.message : String(error)}`
          )
        )
    );
  }

  if (
    deveRodarAgora(
      c.push_locacao_devolucao_ativo,
      c.push_locacao_devolucao_horario,
      c.push_locacao_devolucao_ultimo_envio,
      hojeStr,
      horaAtual
    )
  ) {
    tarefas.push(
      marcarRodadoHoje(supabase, "push_locacao_devolucao_ultimo_envio", hojeStr)
        .then(() => avisarDevolucoesLocacao(supabase, c.push_locacao_devolucao_dias))
        .then((resultado) => registrarResultado(supabase, "push_locacao_devolucao_ultimo_resultado", resultado))
        .catch((error) =>
          registrarResultado(
            supabase,
            "push_locacao_devolucao_ultimo_resultado",
            `Erro: ${error instanceof Error ? error.message : String(error)}`
          )
        )
    );
  }

  if (tarefas.length === 0) return;
  await Promise.all(tarefas);
}
