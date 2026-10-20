"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { LocacaoFormaPagamento, LocacaoStatusPagamento, LocacaoVeiculoStatus, LocacaoVeiculoTipo } from "@/types";
import { hojeBR } from "@/lib/utils";

function str(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}
function strUp(fd: FormData, key: string) {
  const v = str(fd, key);
  return v ? v.toUpperCase() : v;
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

function revalidarLocacao() {
  revalidatePath("/locacao");
  revalidatePath("/locacao/alugueis");
  revalidatePath("/locacao/clientes");
  revalidatePath("/locacao/financeiro");
}

// ---------- Veículos ----------

export async function createVeiculo(formData: FormData) {
  const supabase = await createClient();
  const chassi = str(formData, "chassi");
  const marca = strUp(formData, "marca");
  const modelo = strUp(formData, "modelo");
  if (!chassi || !marca || !modelo) throw new Error("Marca, modelo e chassi são obrigatórios");

  const { error } = await supabase.from("locacao_veiculos").insert({
    tipo: str(formData, "tipo") as LocacaoVeiculoTipo,
    marca,
    modelo,
    cor: strUp(formData, "cor"),
    chassi,
    valor_diaria: num(formData, "valor_diaria") || null,
    observacoes: str(formData, "observacoes"),
  });
  if (error) throw new Error(error.message.includes("unique") ? "Já existe um veículo com esse chassi" : error.message);
  revalidarLocacao();
}

export async function updateVeiculo(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("locacao_veiculos")
    .update({
      tipo: str(formData, "tipo") as LocacaoVeiculoTipo,
      marca: strUp(formData, "marca") ?? undefined,
      modelo: strUp(formData, "modelo") ?? undefined,
      cor: strUp(formData, "cor"),
      chassi: str(formData, "chassi") ?? undefined,
      valor_diaria: num(formData, "valor_diaria") || null,
      observacoes: str(formData, "observacoes"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message.includes("unique") ? "Já existe um veículo com esse chassi" : error.message);
  revalidarLocacao();
}

export async function updateVeiculoStatus(id: string, status: LocacaoVeiculoStatus) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("locacao_veiculos")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidarLocacao();
}

// ---------- Clientes ----------

export async function createCliente(formData: FormData) {
  const supabase = await createClient();
  const nome = strUp(formData, "nome");
  if (!nome) throw new Error("Nome é obrigatório");

  const { data, error } = await supabase
    .from("locacao_clientes")
    .insert({
      nome,
      cpf: str(formData, "cpf"),
      telefone: str(formData, "telefone"),
      observacoes: str(formData, "observacoes"),
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidarLocacao();
  return data.id as string;
}

export async function updateCliente(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("locacao_clientes")
    .update({
      nome: strUp(formData, "nome") ?? undefined,
      cpf: str(formData, "cpf"),
      telefone: str(formData, "telefone"),
      observacoes: str(formData, "observacoes"),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidarLocacao();
}

export async function deleteCliente(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("locacao_clientes").delete().eq("id", id);
  if (error) {
    throw new Error(
      error.message.includes("foreign key")
        ? "Esse cliente já tem aluguéis registrados e não pode ser excluído"
        : error.message
    );
  }
  revalidarLocacao();
}

// ---------- Aluguéis ----------

export interface ClienteNovoInput {
  nome: string;
  cpf?: string | null;
  telefone?: string | null;
}

export async function criarAluguel(input: {
  veiculoId: string;
  clienteId?: string | null;
  clienteNovo?: ClienteNovoInput | null;
  dataRetirada?: string;
  dataPrevistaDevolucao: string;
  valor: number;
  formaPagamento: LocacaoFormaPagamento;
  statusPagamento: LocacaoStatusPagamento;
  kmInicio?: number | null;
  observacoes?: string | null;
}) {
  const supabase = await createClient();

  const { data: veiculo } = await supabase
    .from("locacao_veiculos")
    .select("status")
    .eq("id", input.veiculoId)
    .single();
  if (!veiculo) throw new Error("Veículo não encontrado");
  if (veiculo.status !== "disponivel") throw new Error("Esse veículo não está disponível");

  let clienteId = input.clienteId ?? null;
  if (!clienteId && input.clienteNovo?.nome) {
    const { data: novoCliente, error: clienteError } = await supabase
      .from("locacao_clientes")
      .insert({
        nome: input.clienteNovo.nome.toUpperCase(),
        cpf: input.clienteNovo.cpf ?? null,
        telefone: input.clienteNovo.telefone ?? null,
      })
      .select("id")
      .single();
    if (clienteError) throw new Error(clienteError.message);
    clienteId = novoCliente.id;
  }
  if (!clienteId) throw new Error("Selecione ou cadastre um cliente");

  const { data: novoAluguel, error: aluguelError } = await supabase
    .from("locacao_alugueis")
    .insert({
      veiculo_id: input.veiculoId,
      cliente_id: clienteId,
      data_retirada: input.dataRetirada ?? undefined,
      data_prevista_devolucao: input.dataPrevistaDevolucao,
      valor: input.valor,
      forma_pagamento: input.formaPagamento,
      status_pagamento: "pendente",
      valor_pago: 0,
      data_pagamento: null,
      km_inicio: input.kmInicio ?? null,
      observacoes: input.observacoes ?? null,
    })
    .select("id")
    .single();
  if (aluguelError) throw new Error(aluguelError.message);

  const { error: veiculoError } = await supabase
    .from("locacao_veiculos")
    .update({ status: "alugado", updated_at: new Date().toISOString() })
    .eq("id", input.veiculoId);
  if (veiculoError) throw new Error(veiculoError.message);

  if (input.statusPagamento === "pago") {
    const { error: pagamentoError } = await supabase.from("locacao_aluguel_pagamentos").insert({
      aluguel_id: novoAluguel.id,
      forma_pagamento: input.formaPagamento,
      valor: input.valor,
      data: hojeBR(),
    });
    if (pagamentoError) throw new Error(pagamentoError.message);
    await recalcularPagamentoAluguel(novoAluguel.id);
  }

  revalidarLocacao();
}

export async function atualizarAluguel(
  id: string,
  input: {
    veiculoId: string;
    clienteId: string;
    dataRetirada: string;
    dataPrevistaDevolucao: string;
    valor: number;
    formaPagamento: LocacaoFormaPagamento;
    kmInicio?: number | null;
    kmFim?: number | null;
    observacoes?: string | null;
  }
) {
  const supabase = await createClient();

  const { data: atual } = await supabase
    .from("locacao_alugueis")
    .select("veiculo_id, data_devolucao_real")
    .eq("id", id)
    .single();
  if (!atual) throw new Error("Aluguel não encontrado");

  const estaAberto = !atual.data_devolucao_real;
  const veiculoMudou = atual.veiculo_id !== input.veiculoId;

  if (estaAberto && veiculoMudou) {
    const { data: novoVeiculo } = await supabase
      .from("locacao_veiculos")
      .select("status")
      .eq("id", input.veiculoId)
      .single();
    if (!novoVeiculo) throw new Error("Veículo não encontrado");
    if (novoVeiculo.status !== "disponivel") throw new Error("O novo veículo não está disponível");
  }

  const { error } = await supabase
    .from("locacao_alugueis")
    .update({
      veiculo_id: input.veiculoId,
      cliente_id: input.clienteId,
      data_retirada: input.dataRetirada,
      data_prevista_devolucao: input.dataPrevistaDevolucao,
      valor: input.valor,
      forma_pagamento: input.formaPagamento,
      km_inicio: input.kmInicio ?? null,
      km_fim: input.kmFim ?? null,
      observacoes: input.observacoes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  // O valor total pode ter mudado — refaz o status (pago/parcial/pendente)
  // a partir da soma já lançada em locacao_aluguel_pagamentos.
  await recalcularPagamentoAluguel(id);

  if (estaAberto && veiculoMudou) {
    await supabase
      .from("locacao_veiculos")
      .update({ status: "disponivel", updated_at: new Date().toISOString() })
      .eq("id", atual.veiculo_id);
    await supabase
      .from("locacao_veiculos")
      .update({ status: "alugado", updated_at: new Date().toISOString() })
      .eq("id", input.veiculoId);
  }

  revalidarLocacao();
}

export async function registrarDevolucao(
  aluguelId: string,
  veiculoId: string,
  novoStatusVeiculo: "disponivel" | "manutencao",
  kmFim?: number | null
) {
  const supabase = await createClient();

  const { error: aluguelError } = await supabase
    .from("locacao_alugueis")
    .update({
      data_devolucao_real: new Date().toISOString(),
      km_fim: kmFim ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", aluguelId);
  if (aluguelError) throw new Error(aluguelError.message);

  const { error: veiculoError } = await supabase
    .from("locacao_veiculos")
    .update({ status: novoStatusVeiculo, updated_at: new Date().toISOString() })
    .eq("id", veiculoId);
  if (veiculoError) throw new Error(veiculoError.message);

  revalidarLocacao();
}

// ---------- Pagamentos do aluguel (à vista ou em partes) ----------

// Recalcula o cache de pagamento em locacao_alugueis (valor_pago,
// status_pagamento, data_pagamento, forma_pagamento) a partir da soma dos
// lançamentos em locacao_aluguel_pagamentos — chamado depois de qualquer
// inserção/remoção de pagamento, ou de uma edição que mude o valor total.
async function recalcularPagamentoAluguel(aluguelId: string) {
  const supabase = await createClient();
  const [{ data: aluguel }, { data: pagamentos }] = await Promise.all([
    supabase.from("locacao_alugueis").select("valor").eq("id", aluguelId).single(),
    supabase
      .from("locacao_aluguel_pagamentos")
      .select("valor, data, forma_pagamento")
      .eq("aluguel_id", aluguelId)
      .order("data", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);
  if (!aluguel) throw new Error("Aluguel não encontrado");

  const totalPago = (pagamentos ?? []).reduce((acc, p) => acc + p.valor, 0);
  const statusPagamento: LocacaoStatusPagamento =
    totalPago >= aluguel.valor - 0.001 ? "pago" : totalPago > 0 ? "parcial" : "pendente";
  const ultimoPagamento = pagamentos?.[0] ?? null;

  const { error } = await supabase
    .from("locacao_alugueis")
    .update({
      valor_pago: totalPago,
      status_pagamento: statusPagamento,
      data_pagamento: ultimoPagamento?.data ?? null,
      ...(ultimoPagamento ? { forma_pagamento: ultimoPagamento.forma_pagamento } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", aluguelId);
  if (error) throw new Error(error.message);
}

export async function registrarPagamentoAluguel(
  aluguelId: string,
  input: { formaPagamento: LocacaoFormaPagamento; valor: number; data: string }
) {
  if (input.valor <= 0) throw new Error("Informe um valor válido");
  const supabase = await createClient();
  const { error } = await supabase.from("locacao_aluguel_pagamentos").insert({
    aluguel_id: aluguelId,
    forma_pagamento: input.formaPagamento,
    valor: input.valor,
    data: input.data,
  });
  if (error) throw new Error(error.message);

  await recalcularPagamentoAluguel(aluguelId);
  revalidarLocacao();
}

export async function deletePagamentoAluguel(id: string, aluguelId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("locacao_aluguel_pagamentos").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await recalcularPagamentoAluguel(aluguelId);
  revalidarLocacao();
}

export async function updateAluguelObservacoes(aluguelId: string, observacoes: string | null) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("locacao_alugueis")
    .update({ observacoes, updated_at: new Date().toISOString() })
    .eq("id", aluguelId);
  if (error) throw new Error(error.message);
  revalidarLocacao();
}

// ---------- Despesas ----------

export async function createDespesa(formData: FormData) {
  const supabase = await createClient();
  const descricao = strUp(formData, "descricao");
  if (!descricao) throw new Error("Descrição é obrigatória");

  const { error } = await supabase.from("locacao_despesas").insert({
    data: str(formData, "data") ?? hojeBR(),
    descricao,
    categoria: strUp(formData, "categoria"),
    fornecedor: strUp(formData, "fornecedor"),
    forma_pagamento: str(formData, "forma_pagamento") as LocacaoFormaPagamento | null,
    valor: num(formData, "valor"),
    veiculo_id: str(formData, "veiculo_id") === "nenhum" ? null : str(formData, "veiculo_id"),
    km: intOuNull(formData, "km"),
    observacoes: str(formData, "observacoes"),
  });
  if (error) throw new Error(error.message);
  revalidarLocacao();
}

export async function deleteDespesa(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("locacao_despesas").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidarLocacao();
}

// ---------- Caixa (saldo inicial + ajustes) ----------

export async function updateLocacaoConfig(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("locacao_config")
    .update({
      saldo_inicial: num(formData, "saldo_inicial"),
      data_inicio_caixa: str(formData, "data_inicio_caixa"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  revalidarLocacao();
}

export async function createAjusteCaixa(formData: FormData) {
  const supabase = await createClient();
  const motivo = strUp(formData, "motivo");
  if (!motivo) throw new Error("Motivo é obrigatório");

  const valorAbs = num(formData, "valor");
  const tipo = str(formData, "tipo");
  const valor = tipo === "sai" ? -Math.abs(valorAbs) : Math.abs(valorAbs);

  const { error } = await supabase.from("locacao_ajustes_caixa").insert({
    data: str(formData, "data") ?? hojeBR(),
    motivo,
    valor,
  });
  if (error) throw new Error(error.message);
  revalidarLocacao();
}

export async function deleteAjusteCaixa(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("locacao_ajustes_caixa").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidarLocacao();
}

// ---------- Outras entradas ----------

export async function createOutraEntrada(formData: FormData) {
  const supabase = await createClient();
  const descricao = strUp(formData, "descricao");
  if (!descricao) throw new Error("Descrição é obrigatória");

  const { error } = await supabase.from("locacao_outras_entradas").insert({
    data: str(formData, "data") ?? hojeBR(),
    descricao,
    categoria: strUp(formData, "categoria"),
    forma_pagamento: str(formData, "forma_pagamento") as LocacaoFormaPagamento | null,
    valor: num(formData, "valor"),
    observacoes: str(formData, "observacoes"),
  });
  if (error) throw new Error(error.message);
  revalidarLocacao();
}

export async function deleteOutraEntrada(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("locacao_outras_entradas").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidarLocacao();
}
