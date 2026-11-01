"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PessoalRendaCategoria, PessoalItemSecao, PessoalCartaoCategoria } from "@/types";
import { somarMeses } from "@/lib/pessoal-datas";

function str(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}
function strUp(fd: FormData, key: string) {
  const v = str(fd, key);
  return v ? v.toUpperCase() : v;
}
function parseValor(v: string) {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}
function num(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? parseValor(v) : 0;
}
function intOuNull(fd: FormData, key: string) {
  const v = fd.get(key);
  if (typeof v !== "string" || v.trim() === "") return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

function revalidarPessoal() {
  revalidatePath("/pessoal");
  revalidatePath("/pessoal/ano");
  revalidatePath("/pessoal/cartoes");
}

// ---------- Renda ----------

export async function createRenda(formData: FormData) {
  const supabase = await createClient();
  const descricao = strUp(formData, "descricao");
  const mes = str(formData, "mes");
  if (!descricao || !mes) throw new Error("Descrição e mês são obrigatórios");
  const { error } = await supabase.from("pessoal_renda").insert({
    mes,
    descricao,
    categoria: (str(formData, "categoria") as PessoalRendaCategoria) ?? "outro",
    valor_previsto: num(formData, "valor_previsto"),
  });
  if (error) throw new Error(error.message);
  revalidarPessoal();
}

// Corrige descrição/categoria/previsto de uma renda já lançada. O campo
// "valor_real" só vem no formData quando o diálogo o mostra (já confirmado)
// — por isso só mexe nele quando presente, em vez de sempre sobrescrever.
export async function updateRenda(id: string, formData: FormData) {
  const supabase = await createClient();
  const descricao = strUp(formData, "descricao");
  if (!descricao) throw new Error("Descrição é obrigatória");
  const { error } = await supabase
    .from("pessoal_renda")
    .update({
      descricao,
      categoria: (str(formData, "categoria") as PessoalRendaCategoria) ?? "outro",
      valor_previsto: num(formData, "valor_previsto"),
      ...(formData.has("valor_real") ? { valor_real: num(formData, "valor_real") } : {}),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidarPessoal();
}

export async function confirmarRenda(id: string, valorReal: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("pessoal_renda").update({ valor_real: valorReal }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidarPessoal();
}

// Marca o repasse de terceiros (oficina/VoltCity/empréstimos) do mês como
// recebido, gravando o valor em Renda > "Contas pagas por Terceiros" — é
// aqui que esse dinheiro já entrava na planilha quando caía na conta.
export async function marcarRepasseRecebido(mes: string, valor: number) {
  const supabase = await createClient();
  const { data: existentes } = await supabase
    .from("pessoal_renda")
    .select("id")
    .eq("mes", mes)
    .eq("categoria", "terceiros")
    .is("deletado_em", null)
    .order("created_at");

  const existente = existentes?.[0];
  if (existente) {
    const { error } = await supabase.from("pessoal_renda").update({ valor_real: valor }).eq("id", existente.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("pessoal_renda").insert({
      mes,
      descricao: "CONTAS PAGAS POR TERCEIROS",
      categoria: "terceiros",
      valor_previsto: valor,
      valor_real: valor,
    });
    if (error) throw new Error(error.message);
  }
  revalidarPessoal();
}

export async function deleteRenda(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("pessoal_renda").update({ deletado_em: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidarPessoal();
}

// ---------- Itens do mês (contas fixas, carro, dízimo, extras) ----------

export async function createItemMes(formData: FormData) {
  const supabase = await createClient();
  const descricao = strUp(formData, "descricao");
  const mes = str(formData, "mes");
  const secao = str(formData, "secao") as PessoalItemSecao | null;
  if (!descricao || !mes || !secao) throw new Error("Descrição, mês e seção são obrigatórios");
  const { error } = await supabase.from("pessoal_itens_mes").insert({
    mes,
    secao,
    descricao,
    forma_pagamento: str(formData, "forma_pagamento"),
    valor_previsto: num(formData, "valor_previsto"),
  });
  if (error) throw new Error(error.message);
  revalidarPessoal();
}

// Corrige descrição/forma de pagamento/previsto de um item já lançado.
// "valor_real"/"pago_em" só vêm no formData quando o diálogo os mostra (item
// já confirmado) — por isso só mexe neles quando presentes.
export async function updateItemMes(id: string, formData: FormData) {
  const supabase = await createClient();
  const descricao = strUp(formData, "descricao");
  if (!descricao) throw new Error("Descrição é obrigatória");
  const { error } = await supabase
    .from("pessoal_itens_mes")
    .update({
      descricao,
      forma_pagamento: str(formData, "forma_pagamento"),
      valor_previsto: num(formData, "valor_previsto"),
      ...(formData.has("valor_real")
        ? { valor_real: num(formData, "valor_real"), pago_em: str(formData, "pago_em") }
        : {}),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidarPessoal();
}

export async function confirmarItemMes(id: string, valorReal: number, dataPagamento: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("pessoal_itens_mes")
    .update({ valor_real: valorReal, pago_em: dataPagamento })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidarPessoal();
}

export async function deleteItemMes(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("pessoal_itens_mes").update({ deletado_em: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidarPessoal();
}

// Copia os itens de contas fixas/carro/dízimo do mês anterior pro mês atual
// (sem valor real, como pendentes de novo) — poupa relançar todo mês os
// mesmos nomes, só o que muda é confirmar o valor quando pago. Contas
// extras não são copiadas, por natureza são avulsas.
export async function copiarItensMesAnterior(mesAtual: string) {
  const supabase = await createClient();
  const mesAnterior = somarMeses(mesAtual, -1);

  const [{ data: itensAnteriores }, { data: cartaoAnteriores }] = await Promise.all([
    supabase
      .from("pessoal_itens_mes")
      .select("secao, descricao, forma_pagamento, valor_previsto")
      .eq("mes", mesAnterior)
      .in("secao", ["fixa", "carro", "dizimo"])
      .is("deletado_em", null),
    supabase
      .from("pessoal_cartao_lancamentos")
      .select("cartao_id, categoria, descricao, valor_previsto")
      .eq("mes", mesAnterior)
      .eq("eh_fixa", true)
      .is("deletado_em", null),
  ]);

  if ((!itensAnteriores || itensAnteriores.length === 0) && (!cartaoAnteriores || cartaoAnteriores.length === 0)) {
    throw new Error("Nenhum item fixo no mês anterior pra copiar");
  }

  if (itensAnteriores && itensAnteriores.length > 0) {
    const { error } = await supabase.from("pessoal_itens_mes").insert(
      itensAnteriores.map((item) => ({
        mes: mesAtual,
        secao: item.secao,
        descricao: item.descricao,
        forma_pagamento: item.forma_pagamento,
        valor_previsto: item.valor_previsto,
      }))
    );
    if (error) throw new Error(error.message);
  }

  if (cartaoAnteriores && cartaoAnteriores.length > 0) {
    const { error } = await supabase.from("pessoal_cartao_lancamentos").insert(
      cartaoAnteriores.map((l) => ({
        cartao_id: l.cartao_id,
        mes: mesAtual,
        categoria: l.categoria,
        descricao: l.descricao,
        valor_previsto: l.valor_previsto,
        eh_fixa: true,
      }))
    );
    if (error) throw new Error(error.message);
  }

  revalidarPessoal();
}

// ---------- Cartões ----------

export async function createCartao(formData: FormData) {
  const supabase = await createClient();
  const nome = strUp(formData, "nome");
  if (!nome) throw new Error("Nome é obrigatório");
  const { error } = await supabase.from("pessoal_cartoes").insert({ nome });
  if (error) throw new Error(error.message);
  revalidarPessoal();
}

export async function updateCartao(id: string, formData: FormData) {
  const supabase = await createClient();
  const nome = strUp(formData, "nome");
  if (!nome) throw new Error("Nome é obrigatório");
  const { error } = await supabase.from("pessoal_cartoes").update({ nome }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidarPessoal();
}

export async function setCartaoAtivo(id: string, ativo: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("pessoal_cartoes").update({ ativo }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidarPessoal();
}

// ---------- Lançamentos de cartão ----------

// Registra uma compra no cartão. Se for parcelada (parcela_total > 1), gera
// uma linha por mês (mesmo valor em cada uma), todas com o mesmo compra_id
// — assim dá pra ver "3/6" e também excluir a compra inteira de uma vez.
// Uma mesma compra pode ser rateada em mais de uma categoria (ex: assinatura
// dividida entre Oficina e VoltCity) — cada categoria do rateio vira seu
// próprio compra_id, com as parcelas dela, pra poder editar/excluir cada
// parte do rateio sem afetar as outras.
export async function createLancamentoCartao(formData: FormData) {
  const supabase = await createClient();
  const cartaoId = str(formData, "cartao_id");
  const descricao = strUp(formData, "descricao");
  const mes = str(formData, "mes");
  if (!cartaoId || !descricao || !mes) throw new Error("Preencha todos os campos obrigatórios");

  const categorias = formData.getAll("rateio_categoria") as string[];
  const valores = formData.getAll("rateio_valor") as string[];
  if (categorias.length === 0 || categorias.length !== valores.length) {
    throw new Error("Preencha todos os campos obrigatórios");
  }

  const ehFixa = formData.get("eh_fixa") === "on";
  // Conta fixa (assinatura, seguro) não é parcela com fim marcado — ignora
  // o número de parcelas e lança só o mês atual; o "copiar do mês anterior"
  // é quem traz ela pros meses seguintes.
  const parcelaTotal = ehFixa ? 1 : Math.max(1, intOuNull(formData, "parcela_total") ?? 1);

  const linhas = categorias.flatMap((categoria, idx) => {
    const compraId = crypto.randomUUID();
    const valorPrevisto = parseValor(valores[idx]);
    return Array.from({ length: parcelaTotal }, (_, i) => ({
      cartao_id: cartaoId,
      compra_id: compraId,
      mes: somarMeses(mes, i),
      categoria: categoria as PessoalCartaoCategoria,
      descricao,
      parcela_atual: i + 1,
      parcela_total: parcelaTotal,
      valor_previsto: valorPrevisto,
      eh_fixa: ehFixa,
    }));
  });

  const { error } = await supabase.from("pessoal_cartao_lancamentos").insert(linhas);
  if (error) throw new Error(error.message);
  revalidarPessoal();
}

// Corrige descrição/categoria/previsto de um lançamento já criado — não mexe
// em cartão/parcela/compra_id, pra não bagunçar o agrupamento de uma compra
// parcelada (pra isso é excluir a compra inteira e relançar). "valor_real"
// só vem no formData quando o diálogo o mostra (já confirmado).
export async function updateLancamentoCartao(id: string, formData: FormData) {
  const supabase = await createClient();
  const descricao = strUp(formData, "descricao");
  const categoria = str(formData, "categoria") as PessoalCartaoCategoria | null;
  if (!descricao || !categoria) throw new Error("Preencha todos os campos obrigatórios");
  const { error } = await supabase
    .from("pessoal_cartao_lancamentos")
    .update({
      descricao,
      categoria,
      valor_previsto: num(formData, "valor_previsto"),
      eh_fixa: formData.get("eh_fixa") === "on",
      ...(formData.has("valor_real") ? { valor_real: num(formData, "valor_real") } : {}),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidarPessoal();
}

export async function confirmarLancamentoCartao(id: string, valorReal: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("pessoal_cartao_lancamentos").update({ valor_real: valorReal }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidarPessoal();
}

// Confirma de uma vez todos os lançamentos ainda pendentes de um
// cartão/mês, assumindo que o valor cobrado bateu com o previsto — o
// atalho de "já sei o valor, paguei o cartão, confirmo" pro grosso dos
// lançamentos; os que vieram diferentes continuam editáveis um a um.
export async function confirmarFaturaCartao(cartaoId: string, mes: string) {
  const supabase = await createClient();
  const { data: pendentes } = await supabase
    .from("pessoal_cartao_lancamentos")
    .select("id, valor_previsto")
    .eq("cartao_id", cartaoId)
    .eq("mes", mes)
    .is("valor_real", null)
    .is("deletado_em", null);

  if (!pendentes || pendentes.length === 0) throw new Error("Nada pendente nesse cartão/mês");

  await Promise.all(
    pendentes.map((p) => supabase.from("pessoal_cartao_lancamentos").update({ valor_real: p.valor_previsto }).eq("id", p.id))
  );
  revalidarPessoal();
}

export async function deleteLancamentoCartao(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("pessoal_cartao_lancamentos")
    .update({ deletado_em: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidarPessoal();
}

// Exclui a compra inteira (todas as parcelas, passadas e futuras) — pra
// desfazer um lançamento parcelado errado sem ter que apagar linha por
// linha.
export async function deleteCompraCartao(compraId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("pessoal_cartao_lancamentos")
    .update({ deletado_em: new Date().toISOString() })
    .eq("compra_id", compraId);
  if (error) throw new Error(error.message);
  revalidarPessoal();
}
