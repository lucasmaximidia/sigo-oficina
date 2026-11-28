"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

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

function revalidarKids() {
  revalidatePath("/locacao/kids");
  revalidatePath("/kids/pagamento");
}

// Confere que quem está chamando a action é um admin ativo — usado em toda
// ação de gestão (operadores, preços) antes de qualquer escrita privilegiada.
async function exigirAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: perfil } = await supabase.from("profiles").select("role, ativo").eq("id", user.id).single();
  if (!perfil || perfil.role !== "admin" || !perfil.ativo) throw new Error("Só administradores podem fazer isso");
  return user;
}

// ---------- Operadores (gestão via service role — auth.admin.* exige isso) ----------

export interface OperadorKids {
  id: string;
  email: string | null;
  nome: string | null;
  ativo: boolean;
  created_at: string;
}

export async function listarOperadoresKids(): Promise<OperadorKids[]> {
  await exigirAdmin();
  const supabase = await createClient();
  const { data: perfis, error } = await supabase
    .from("profiles")
    .select("id, nome, ativo, created_at")
    .eq("role", "operador_kids")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  if (!perfis || perfis.length === 0) return [];

  // E-mail não fica em profiles — só existe em auth.users, que só o cliente
  // service-role enxerga.
  const service = createServiceClient();
  const emailPorId = new Map<string, string | null>();
  await Promise.all(
    perfis.map(async (p) => {
      const { data } = await service.auth.admin.getUserById(p.id);
      emailPorId.set(p.id, data.user?.email ?? null);
    })
  );

  return perfis.map((p) => ({
    id: p.id,
    email: emailPorId.get(p.id) ?? null,
    nome: p.nome,
    ativo: p.ativo,
    created_at: p.created_at,
  }));
}

export async function criarOperadorKids(formData: FormData) {
  await exigirAdmin();
  const nome = str(formData, "nome");
  const email = str(formData, "email");
  const senha = str(formData, "senha");
  if (!nome) throw new Error("Informe o nome do operador");
  if (!email) throw new Error("Informe um e-mail (pode ser fictício)");
  if (!senha || senha.length < 6) throw new Error("A senha precisa ter pelo menos 6 caracteres");

  const service = createServiceClient();
  const { data, error } = await service.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  });
  if (error) throw new Error(error.message);

  // O trigger on_auth_user_created já criou a linha em profiles (role
  // padrão 'admin') — aqui ajustamos pro papel certo e o nome.
  const { error: perfilError } = await service
    .from("profiles")
    .update({ role: "operador_kids", nome, updated_at: new Date().toISOString() })
    .eq("id", data.user.id);
  if (perfilError) throw new Error(perfilError.message);

  revalidarKids();
}

export async function alternarOperadorAtivo(id: string, ativo: boolean) {
  await exigirAdmin();
  const service = createServiceClient();
  const { error } = await service.from("profiles").update({ ativo, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidarKids();
}

export async function redefinirSenhaOperador(id: string, novaSenha: string) {
  await exigirAdmin();
  if (!novaSenha || novaSenha.length < 6) throw new Error("A senha precisa ter pelo menos 6 caracteres");
  const service = createServiceClient();
  const { error } = await service.auth.admin.updateUserById(id, { password: novaSenha });
  if (error) throw new Error(error.message);
}

// ---------- Preços (RLS já restringe a admin — cliente normal) ----------

export async function criarPrecoKids(formData: FormData) {
  const supabase = await createClient();
  const tempoMin = intOuNull(formData, "tempo_min");
  if (!tempoMin || tempoMin <= 0) throw new Error("Informe o tempo em minutos");
  const valor = num(formData, "valor");

  const { error } = await supabase.from("kids_precos").insert({ tempo_min: tempoMin, valor, ordem: tempoMin });
  if (error) throw new Error(error.message);
  revalidarKids();
}

export async function salvarPrecoKids(id: string, formData: FormData) {
  const supabase = await createClient();
  const tempoMin = intOuNull(formData, "tempo_min");
  if (!tempoMin || tempoMin <= 0) throw new Error("Informe o tempo em minutos");
  const valor = num(formData, "valor");

  const { error } = await supabase
    .from("kids_precos")
    .update({ tempo_min: tempoMin, valor, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidarKids();
}

export async function alternarPrecoAtivo(id: string, ativo: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("kids_precos").update({ ativo, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidarKids();
}

export async function removerPrecoKids(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("kids_precos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidarKids();
}

// ---------- Pagamentos (operador) ----------

// Dinheiro e maquininha: o operador confirma que recebeu, e o pagamento já
// nasce "pago" — o valor nunca vem do formulário, só o tempo escolhido.
export async function criarPagamentoManualKids(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const tempoMin = intOuNull(formData, "tempo_min");
  const formaPagamento = str(formData, "forma_pagamento");
  if (!tempoMin) throw new Error("Escolha o tempo");
  if (formaPagamento !== "dinheiro" && formaPagamento !== "maquininha") {
    throw new Error("Forma de pagamento inválida");
  }

  const { data: preco, error: precoError } = await supabase
    .from("kids_precos")
    .select("valor")
    .eq("tempo_min", tempoMin)
    .eq("ativo", true)
    .single();
  if (precoError || !preco) throw new Error("Esse tempo não está mais disponível");

  const { error } = await supabase.from("kids_pagamentos").insert({
    operador_id: user.id,
    tempo_min: tempoMin,
    valor: preco.valor,
    forma_pagamento: formaPagamento,
    status: "pago",
    pagamento_manual: true,
    pago_em: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
  revalidarKids();
}
