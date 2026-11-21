"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createDespesa } from "@/lib/locacao-actions";
import { dataBR, formatDate } from "@/lib/utils";
import type { LocacaoComandoDispositivo, LocacaoFormaPagamento } from "@/types";

function str(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}
function num(fd: FormData, key: string) {
  const v = fd.get(key);
  const n = typeof v === "string" ? parseFloat(v.replace(",", ".")) : NaN;
  return Number.isFinite(n) ? n : 0;
}
function intOuNull(fd: FormData, key: string) {
  const v = fd.get(key);
  if (typeof v !== "string" || v.trim() === "") return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function revalidarCarrinhos() {
  revalidatePath("/locacao/carrinhos");
}

// ---------- Cadastro / token ----------

// Gera o device_token (usado no cadastro e ao regenerar) — não depende do
// default do banco porque um UPDATE não reaproveita o `default` da coluna.
function novoToken() {
  return crypto.randomUUID();
}

export async function cadastrarCarrinho(formData: FormData) {
  const supabase = await createClient();
  const numeroCarrinho = intOuNull(formData, "numero_carrinho");
  if (!numeroCarrinho || numeroCarrinho <= 0) throw new Error("Informe o número do carrinho");
  const veiculoId = str(formData, "veiculo_id");

  const { data, error } = await supabase
    .from("locacao_dispositivos")
    .insert({
      numero_carrinho: numeroCarrinho,
      veiculo_id: veiculoId && veiculoId !== "nenhum" ? veiculoId : null,
      device_token: novoToken(),
    })
    .select("numero_carrinho, device_token")
    .single();
  if (error) {
    throw new Error(
      error.message.includes("duplicate") || error.message.includes("unique")
        ? `Já existe um carrinho número ${numeroCarrinho}`
        : error.message
    );
  }
  revalidarCarrinhos();
  return { numeroCarrinho: data.numero_carrinho, deviceToken: data.device_token };
}

// Pro carrinho perdido/clonado: o token antigo para de funcionar na hora
// (nada mais valida contra ele).
export async function regenerarTokenCarrinho(dispositivoId: string) {
  const supabase = await createClient();
  const token = novoToken();
  const { data, error } = await supabase
    .from("locacao_dispositivos")
    .update({ device_token: token, updated_at: new Date().toISOString() })
    .eq("id", dispositivoId)
    .select("numero_carrinho, device_token")
    .single();
  if (error) throw new Error(error.message);
  revalidarCarrinhos();
  return { numeroCarrinho: data.numero_carrinho, deviceToken: data.device_token };
}

export async function vincularVeiculoCarrinho(dispositivoId: string, veiculoId: string | null) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("locacao_dispositivos")
    .update({ veiculo_id: veiculoId, updated_at: new Date().toISOString() })
    .eq("id", dispositivoId);
  if (error) throw new Error(error.message);
  revalidarCarrinhos();
}

// ---------- Manutenção ----------

// Zera a contagem "horas desde a última manutenção" a partir do horímetro
// atual do carrinho — não tem uma tabela de histórico, só a última data/base
// (ver locacao_dispositivos.manutencao_horimetro_min/manutencao_em).
export async function registrarManutencaoCarrinho(dispositivoId: string) {
  const supabase = await createClient();
  const { data: dispositivo, error: errorBusca } = await supabase
    .from("locacao_dispositivos")
    .select("horimetro_minutos")
    .eq("id", dispositivoId)
    .single();
  if (errorBusca) throw new Error(errorBusca.message);

  const { error } = await supabase
    .from("locacao_dispositivos")
    .update({
      manutencao_horimetro_min: dispositivo.horimetro_minutos,
      manutencao_em: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", dispositivoId);
  if (error) throw new Error(error.message);
  revalidarCarrinhos();
}

// ---------- Configuração da frota ----------

export async function salvarConfigDispositivos(formData: FormData) {
  const supabase = await createClient();
  const minutos15 = intOuNull(formData, "minutos_cartao_15min");
  const minutos5 = intOuNull(formData, "minutos_cartao_5min");
  const tempoMax = intOuNull(formData, "tempo_max_min");
  const livreMax = intOuNull(formData, "livre_max_min");
  const horasManutencao = intOuNull(formData, "horas_manutencao");
  if (!minutos15 || !minutos5 || !tempoMax || !livreMax || !horasManutencao)
    throw new Error("Informe os minutos, os limites de tempo e o intervalo de manutenção");

  const { error } = await supabase
    .from("locacao_dispositivo_config")
    .update({
      minutos_cartao_15min: clamp(minutos15, 1, 60),
      minutos_cartao_5min: clamp(minutos5, 1, 60),
      tempo_max_min: clamp(tempoMax, 10, 120),
      livre_max_min: clamp(livreMax, 10, 720),
      horas_manutencao: clamp(horasManutencao, 10, 1000),
      preco_cartao_15min: Math.max(0, num(formData, "preco_cartao_15min")),
      preco_cartao_5min: Math.max(0, num(formData, "preco_cartao_5min")),
      preco_livre_hora: Math.max(0, num(formData, "preco_livre_hora")),
      bateria_minima: clamp(num(formData, "bateria_minima"), 0, 40),
      bateria_aviso: clamp(num(formData, "bateria_aviso"), 0, 40),
      firmware_versao_alvo: str(formData, "firmware_versao_alvo"),
      firmware_url: str(formData, "firmware_url"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  revalidarCarrinhos();
}

// Sobe o .bin pro bucket público "firmware" e já atualiza o link na
// configuração (e a versão-alvo, se informada) — sem precisar colar o link
// manualmente depois.
export async function enviarFirmware(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("arquivo");
  if (!(file instanceof File) || file.size === 0) throw new Error("Selecione o arquivo .bin");
  if (!file.name.toLowerCase().endsWith(".bin")) throw new Error("O arquivo precisa ser um .bin");

  const versao = str(formData, "firmware_versao_alvo");
  const caminho = versao ? `${versao.replace(/[^a-zA-Z0-9._-]/g, "_")}.bin` : `${crypto.randomUUID()}.bin`;

  const { error: uploadError } = await supabase.storage.from("firmware").upload(caminho, file, {
    contentType: "application/octet-stream",
    upsert: true,
  });
  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrlData } = supabase.storage.from("firmware").getPublicUrl(caminho);

  const { error } = await supabase
    .from("locacao_dispositivo_config")
    .update({
      firmware_url: publicUrlData.publicUrl,
      ...(versao ? { firmware_versao_alvo: versao } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  revalidarCarrinhos();
}

// ---------- Comandos remotos ----------

// O carrinho só vê o comando no próximo heartbeat (até ~1 min no Wi-Fi) e o
// confirma de volta via dispositivo_heartbeat_v2 — ver migration 0072.
export async function enviarComandoCarrinho(dispositivoId: string, comando: LocacaoComandoDispositivo) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("dispositivo_enviar_comando", {
    p_dispositivo_id: dispositivoId,
    p_comando: comando,
  });
  if (error) throw new Error(error.message);
  revalidarCarrinhos();
}

// Só sessões ainda não lançadas no caixa (entrada_id nulo) — é o critério
// que diferencia "teste de bancada" de aluguel real já fechado.
export async function apagarHistoricoTesteCarrinho(dispositivoId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("locacao_dispositivo_sessoes")
    .delete()
    .eq("dispositivo_id", dispositivoId)
    .is("entrada_id", null);
  if (error) throw new Error(error.message);
  revalidarCarrinhos();
}

// ---------- Faturamento ----------

interface SessaoParaFaturar {
  id: string;
  valor: number;
  finalizado_em: string | null;
  created_at: string;
  cartao_tipo: string;
  qtd_15min: number;
  qtd_5min: number;
  minutos: number;
}

async function buscarSessoesSemLancamento(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dispositivoId: string | null
) {
  let query = supabase
    .from("locacao_dispositivo_sessoes")
    .select("id, valor, finalizado_em, created_at, cartao_tipo, qtd_15min, qtd_5min, minutos")
    .is("entrada_id", null);
  if (dispositivoId) query = query.eq("dispositivo_id", dispositivoId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as SessaoParaFaturar[];
}

function diaDaSessao(s: Pick<SessaoParaFaturar, "finalizado_em" | "created_at">) {
  return dataBR(s.finalizado_em ?? s.created_at);
}

// Núcleo do lançamento no caixa, compartilhado entre o "Lançar no caixa" (com
// período livre, aba Faturamento) e a prestação de contas dia a dia (aba
// Financeiro). Retorna null quando não há nada pendente no período.
async function lancarNoCaixaCore(
  supabase: Awaited<ReturnType<typeof createClient>>,
  periodoInicio: string,
  periodoFim: string,
  dispositivoId: string | null,
  formaPagamento: LocacaoFormaPagamento
) {
  const sessoes = await buscarSessoesSemLancamento(supabase, dispositivoId);
  const doPeriodo = sessoes.filter((s) => {
    const dia = diaDaSessao(s);
    return dia >= periodoInicio && dia <= periodoFim;
  });
  if (doPeriodo.length === 0) return null;

  const valorTotal = doPeriodo.reduce((acc, s) => acc + s.valor, 0);
  const descricao =
    periodoInicio === periodoFim
      ? `Carrinhos ${formatDate(periodoInicio)} – ${doPeriodo.length} aluguel(éis)`
      : `Carrinhos ${formatDate(periodoInicio)} a ${formatDate(periodoFim)} – ${doPeriodo.length} aluguel(éis)`;

  const { data: entrada, error: errorEntrada } = await supabase
    .from("locacao_outras_entradas")
    .insert({
      data: periodoFim,
      descricao,
      categoria: "CARRINHOS",
      forma_pagamento: formaPagamento,
      valor: valorTotal,
    })
    .select("id")
    .single();
  if (errorEntrada) throw new Error(errorEntrada.message);

  const { error: errorSessoes } = await supabase
    .from("locacao_dispositivo_sessoes")
    .update({ entrada_id: entrada.id })
    .in(
      "id",
      doPeriodo.map((s) => s.id)
    );
  if (errorSessoes) throw new Error(errorSessoes.message);

  return { valor: valorTotal, quantidade: doPeriodo.length };
}

export async function lancarCarrinhosNoCaixa(formData: FormData) {
  const supabase = await createClient();
  const periodoInicio = str(formData, "periodo_inicio");
  const periodoFim = str(formData, "periodo_fim");
  const formaPagamento = str(formData, "forma_pagamento") as LocacaoFormaPagamento | null;
  const dispositivoId = str(formData, "dispositivo_id");
  if (!periodoInicio || !periodoFim || !formaPagamento) throw new Error("Informe o período e a forma de pagamento");

  const resultado = await lancarNoCaixaCore(supabase, periodoInicio, periodoFim, dispositivoId, formaPagamento);
  if (!resultado) throw new Error("Nenhum aluguel sem lançamento nesse período");

  revalidarCarrinhos();
  revalidatePath("/locacao/financeiro");
  return resultado;
}

// ---------- Financeiro (prestação de contas dia a dia) ----------

// O funcionário sai com os carrinhos, recebe em dinheiro na praça e presta
// contas ao voltar: lança o valor do dia no caixa e, no mesmo passo, registra
// a diária paga a ele (uma despesa — pode variar de funcionário e de valor a
// cada dia, por isso é digitada aqui em vez de fixa na configuração).
export async function registrarPrestacaoContasCarrinhos(formData: FormData) {
  const supabase = await createClient();
  const dia = str(formData, "dia");
  if (!dia) throw new Error("Informe o dia");
  const formaPagamento = (str(formData, "forma_pagamento") as LocacaoFormaPagamento | null) ?? "dinheiro";
  const funcionario = str(formData, "funcionario_nome");
  const diariaValor = Math.max(0, num(formData, "diaria_valor"));

  const lancamento = await lancarNoCaixaCore(supabase, dia, dia, null, formaPagamento);

  if (diariaValor > 0) {
    const descricao = funcionario
      ? `DIÁRIA CARRINHOS - ${funcionario.toUpperCase()} - ${formatDate(dia)}`
      : `DIÁRIA CARRINHOS - ${formatDate(dia)}`;
    const { error } = await supabase.from("locacao_despesas").insert({
      data: dia,
      descricao,
      categoria: "DIARIA CARRINHOS",
      forma_pagamento: formaPagamento,
      valor: diariaValor,
    });
    if (error) throw new Error(error.message);
  }

  if (!lancamento && diariaValor === 0) throw new Error("Nada para registrar nesse dia");

  revalidarCarrinhos();
  revalidatePath("/locacao/financeiro");
  return { valorRecebido: lancamento?.valor ?? 0, diariaValor };
}

// Saída avulsa (manutenção, peça, etc.) — mesma despesa da locação (categoria
// "CARRINHOS"), só com um atalho dedicado nessa aba.
export async function registrarSaidaCarrinho(formData: FormData) {
  formData.set("categoria", "CARRINHOS");
  await createDespesa(formData);
  revalidarCarrinhos();
}

// Recalcula só o que ainda não foi lançado no caixa — um aluguel já lançado
// representa dinheiro que já entrou com aquele valor, então não muda depois
// que o preço é corrigido (ver locacao_carrinho_valor, migration 0072).
export async function recalcularValoresCarrinhos(formData: FormData) {
  const supabase = await createClient();
  const periodoInicio = str(formData, "periodo_inicio");
  const periodoFim = str(formData, "periodo_fim");
  const dispositivoId = str(formData, "dispositivo_id");

  const { data: config, error: errorConfig } = await supabase
    .from("locacao_dispositivo_config")
    .select("preco_cartao_15min, preco_cartao_5min, preco_livre_hora")
    .eq("id", 1)
    .single();
  if (errorConfig) throw new Error(errorConfig.message);

  const sessoes = await buscarSessoesSemLancamento(supabase, dispositivoId);
  const doPeriodo = sessoes.filter((s) => {
    if (!periodoInicio || !periodoFim) return true;
    const dia = diaDaSessao(s);
    return dia >= periodoInicio && dia <= periodoFim;
  });

  let atualizados = 0;
  await Promise.all(
    doPeriodo.map(async (s) => {
      const novoValor =
        s.cartao_tipo === "LIVRE"
          ? Math.round(((s.minutos * config.preco_livre_hora) / 60) * 100) / 100
          : s.qtd_15min * config.preco_cartao_15min + s.qtd_5min * config.preco_cartao_5min;
      if (novoValor === s.valor) return;
      const { error } = await supabase.from("locacao_dispositivo_sessoes").update({ valor: novoValor }).eq("id", s.id);
      if (error) throw new Error(error.message);
      atualizados += 1;
    })
  );

  revalidarCarrinhos();
  return { atualizados };
}
