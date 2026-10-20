"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { LocacaoFormaPagamento, LocacaoStatusPagamento, LocacaoVeiculoStatus, LocacaoVeiculoTipo } from "@/types";

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
  dataPrevistaDevolucao: string;
  valor: number;
  formaPagamento: LocacaoFormaPagamento;
  statusPagamento: LocacaoStatusPagamento;
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

  const { error: aluguelError } = await supabase.from("locacao_alugueis").insert({
    veiculo_id: input.veiculoId,
    cliente_id: clienteId,
    data_prevista_devolucao: input.dataPrevistaDevolucao,
    valor: input.valor,
    forma_pagamento: input.formaPagamento,
    status_pagamento: input.statusPagamento,
    valor_pago: input.statusPagamento === "pago" ? input.valor : 0,
    data_pagamento: input.statusPagamento === "pago" ? new Date().toISOString().slice(0, 10) : null,
    observacoes: input.observacoes ?? null,
  });
  if (aluguelError) throw new Error(aluguelError.message);

  const { error: veiculoError } = await supabase
    .from("locacao_veiculos")
    .update({ status: "alugado", updated_at: new Date().toISOString() })
    .eq("id", input.veiculoId);
  if (veiculoError) throw new Error(veiculoError.message);

  revalidarLocacao();
}

export async function registrarDevolucao(
  aluguelId: string,
  veiculoId: string,
  novoStatusVeiculo: "disponivel" | "manutencao"
) {
  const supabase = await createClient();

  const { error: aluguelError } = await supabase
    .from("locacao_alugueis")
    .update({ data_devolucao_real: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", aluguelId);
  if (aluguelError) throw new Error(aluguelError.message);

  const { error: veiculoError } = await supabase
    .from("locacao_veiculos")
    .update({ status: novoStatusVeiculo, updated_at: new Date().toISOString() })
    .eq("id", veiculoId);
  if (veiculoError) throw new Error(veiculoError.message);

  revalidarLocacao();
}

export async function marcarAluguelPago(aluguelId: string, valorPago: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("locacao_alugueis")
    .update({
      status_pagamento: "pago",
      valor_pago: valorPago,
      data_pagamento: new Date().toISOString().slice(0, 10),
      updated_at: new Date().toISOString(),
    })
    .eq("id", aluguelId);
  if (error) throw new Error(error.message);
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
    data: str(formData, "data") ?? new Date().toISOString().slice(0, 10),
    descricao,
    categoria: strUp(formData, "categoria"),
    fornecedor: strUp(formData, "fornecedor"),
    forma_pagamento: str(formData, "forma_pagamento") as LocacaoFormaPagamento | null,
    valor: num(formData, "valor"),
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
