"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import type {
  Database,
  OsStatus,
  OsUrgencia,
  OsOrigem,
  FormaPagamento,
  TipoCartao,
  ItemOrigem,
  AgendaTipo,
  AgendaStatus,
  OrcamentoStatus,
  OrcamentoItemTipo,
  FreteStatus,
  FreteTipo,
  RetiradaTipo,
} from "@/types";

function str(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}
function num(fd: FormData, key: string) {
  const v = fd.get(key);
  const n = typeof v === "string" ? parseFloat(v.replace(",", ".")) : NaN;
  return Number.isFinite(n) ? n : 0;
}
// Campos de texto livre digitados pelo usuário são sempre salvos em maiúsculo,
// independente de como foram digitados (padroniza cadastros e relatórios).
function strUp(fd: FormData, key: string) {
  const v = str(fd, key);
  return v ? v.toUpperCase() : v;
}

// ---------- Clientes ----------
export async function createCliente(formData: FormData) {
  const nome = strUp(formData, "nome");
  if (!nome) throw new Error("Nome é obrigatório");
  const { data, error } = await supabase
    .from("clientes")
    .insert({
      nome,
      telefone: str(formData, "telefone"),
      email: str(formData, "email"),
      cpf_cnpj: str(formData, "cpf_cnpj"),
      endereco: strUp(formData, "endereco"),
      bairro: strUp(formData, "bairro"),
      cidade: strUp(formData, "cidade"),
      estado: strUp(formData, "estado"),
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/clientes");
  revalidatePath("/dashboard");
  return data.id as string;
}

export async function updateCliente(id: string, formData: FormData) {
  const nome = strUp(formData, "nome");
  if (!nome) throw new Error("Nome é obrigatório");
  const { error } = await supabase
    .from("clientes")
    .update({
      nome,
      telefone: str(formData, "telefone"),
      email: str(formData, "email"),
      cpf_cnpj: str(formData, "cpf_cnpj"),
      endereco: strUp(formData, "endereco"),
      bairro: strUp(formData, "bairro"),
      cidade: strUp(formData, "cidade"),
      estado: strUp(formData, "estado"),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/clientes");
}

export async function createEquipamento(clienteId: string, formData: FormData) {
  const tipo = strUp(formData, "tipo");
  if (!tipo) throw new Error("Tipo é obrigatório");
  const { error } = await supabase.from("equipamentos").insert({
    cliente_id: clienteId,
    tipo,
    marca: strUp(formData, "marca"),
    modelo: strUp(formData, "modelo"),
    numero_serie: strUp(formData, "numero_serie"),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/clientes");
}

export async function updateEquipamento(id: string, osId: string, formData: FormData) {
  const tipo = strUp(formData, "tipo");
  if (!tipo) throw new Error("Tipo é obrigatório");
  const { error } = await supabase
    .from("equipamentos")
    .update({
      tipo,
      marca: strUp(formData, "marca"),
      modelo: strUp(formData, "modelo"),
      numero_serie: strUp(formData, "numero_serie"),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/clientes");
  revalidatePath(`/ordens-servico/${osId}`);
}

// ---------- Ordens de Serviço ----------
export async function createOrdemServico(formData: FormData) {
  let clienteId = str(formData, "cliente_id");

  if (!clienteId) {
    const nome = strUp(formData, "cliente_nome");
    if (!nome) throw new Error("Informe o cliente");
    const { data: novoCliente, error: clienteError } = await supabase
      .from("clientes")
      .insert({ nome, telefone: str(formData, "cliente_telefone") })
      .select("id")
      .single();
    if (clienteError) throw new Error(clienteError.message);
    clienteId = novoCliente.id;
  }

  let equipamentoId: string | null = null;
  const tipoEquipamento = strUp(formData, "equipamento_tipo");
  if (tipoEquipamento) {
    const { data: equipamento, error: equipamentoError } = await supabase
      .from("equipamentos")
      .insert({
        cliente_id: clienteId,
        tipo: tipoEquipamento,
        marca: strUp(formData, "equipamento_marca"),
        modelo: strUp(formData, "equipamento_modelo"),
        numero_serie: strUp(formData, "equipamento_serie"),
      })
      .select("id")
      .single();
    if (equipamentoError) throw new Error(equipamentoError.message);
    equipamentoId = equipamento.id;
  }

  const dataEntradaStr = str(formData, "data_entrada");
  const dataEntrada = dataEntradaStr
    ? new Date(`${dataEntradaStr}T${new Date().toTimeString().slice(0, 8)}`).toISOString()
    : undefined;

  const { data: os, error } = await supabase
    .from("ordens_servico")
    .insert({
      cliente_id: clienteId,
      equipamento_id: equipamentoId,
      problema_relatado: strUp(formData, "problema_relatado"),
      urgencia: (str(formData, "urgencia") as OsUrgencia) ?? "media",
      origem: (str(formData, "origem") as OsOrigem) ?? "balcao",
      status: "aguardando_orcamento",
      data_entrada: dataEntrada,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/ordens-servico");
  revalidatePath("/dashboard");
  return os.id as string;
}

export async function updateOrdemServicoValores(id: string, formData: FormData) {
  const { error } = await supabase
    .from("ordens_servico")
    .update({
      diagnostico: str(formData, "diagnostico"),
      valor_mao_obra: num(formData, "valor_mao_obra"),
      valor_frete: num(formData, "valor_frete"),
      desconto: num(formData, "desconto"),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/ordens-servico/${id}`);
}

export async function updateOrdemServicoStatus(id: string, status: OsStatus) {
  const patch: Database["public"]["Tables"]["ordens_servico"]["Update"] = { status };
  if (status === "finalizado") patch.data_finalizacao = new Date().toISOString();
  const { error } = await supabase.from("ordens_servico").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/ordens-servico/${id}`);
  revalidatePath("/ordens-servico");
  revalidatePath("/dashboard");
  revalidatePath("/garantias");
}

export async function updateObservacoesOs(id: string, observacoes: string) {
  const { error } = await supabase
    .from("ordens_servico")
    .update({ observacoes_internas: observacoes.trim() || null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/ordens-servico/${id}`);
}

export async function createEmpresaAutorizada(formData: FormData) {
  const nome = strUp(formData, "nome");
  if (!nome) throw new Error("Nome é obrigatório");
  const { data, error } = await supabase
    .from("empresas_autorizadas")
    .insert({ nome, telefone: str(formData, "telefone") })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/ordens-servico");
  revalidatePath("/financeiro");
  return data.id as string;
}

export async function updateOrdemServicoAutorizada(
  id: string,
  input: {
    empresaAutorizadaId: string | null;
    numeroOsAutorizada: string | null;
    referenciaAutorizada: string | null;
    produtoAutorizada: string | null;
    numeroSerieAutorizada: string | null;
  }
) {
  const { error } = await supabase
    .from("ordens_servico")
    .update({
      empresa_autorizada_id: input.empresaAutorizadaId,
      numero_os_autorizada: input.numeroOsAutorizada,
      referencia_autorizada: input.referenciaAutorizada,
      produto_autorizada: input.produtoAutorizada,
      numero_serie_autorizada: input.numeroSerieAutorizada,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/ordens-servico/${id}`);
  revalidatePath("/ordens-servico");
}

export async function setOrdemServicoParada(id: string, parada: boolean, motivo?: string) {
  const { error } = await supabase
    .from("ordens_servico")
    .update({ parada, parada_motivo: parada ? motivo ?? null : null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/ordens-servico/${id}`);
  revalidatePath("/dashboard");
}

export async function deleteOrdemServico(id: string) {
  const { error } = await supabase.from("ordens_servico").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/ordens-servico");
  revalidatePath("/dashboard");
  revalidatePath("/financeiro");
  revalidatePath("/garantias");
}

// Soma tudo que compõe o valor de uma OS (peças + mão de obra + frete -
// desconto) e quanto já foi pago até agora nos pagamentos registrados.
async function getOsTotais(osId: string) {
  const [{ data: os }, { data: itens }, { data: pagamentos }] = await Promise.all([
    supabase.from("ordens_servico").select("valor_mao_obra, valor_frete, desconto").eq("id", osId).single(),
    supabase.from("os_itens").select("quantidade, valor_unitario").eq("os_id", osId),
    supabase.from("os_pagamentos").select("valor").eq("os_id", osId),
  ]);
  const totalItens = (itens ?? []).reduce((acc, i) => acc + i.quantidade * i.valor_unitario, 0);
  const total = os ? totalItens + os.valor_mao_obra + os.valor_frete - os.desconto : 0;
  const totalPago = (pagamentos ?? []).reduce((acc, p) => acc + p.valor, 0);
  return { total, totalPago };
}

// Registra um pagamento (total ou parcial/adiantado) numa OS, em qualquer
// status — o cliente pode pagar um sinal antes da OS ficar pronta. Quando a
// soma dos pagamentos quita o valor total, os campos legados de pagamento
// em ordens_servico são preenchidos com os dados desse pagamento: é esse
// sinal que o Financeiro (entradas, acerto com parceiros) e os relatórios
// usam pra saber que a OS está paga, então isso continua funcionando sem
// precisar mexer nessas telas.
export async function registrarPagamentoOs(
  osId: string,
  input: {
    formaPagamento: FormaPagamento;
    valor: number;
    data: string;
    tipoCartao?: TipoCartao | null;
    valorRecebidoLiquido?: number | null;
  }
) {
  if (input.valor <= 0) throw new Error("Informe um valor válido");
  const isCartao = input.formaPagamento === "cartao";
  const { error } = await supabase.from("os_pagamentos").insert({
    os_id: osId,
    forma_pagamento: input.formaPagamento,
    tipo_cartao: isCartao ? input.tipoCartao ?? null : null,
    valor: input.valor,
    valor_recebido_liquido: isCartao ? input.valorRecebidoLiquido ?? null : null,
    data: input.data,
  });
  if (error) throw new Error(error.message);

  const { total, totalPago } = await getOsTotais(osId);
  if (totalPago >= total - 0.001) {
    await supabase
      .from("ordens_servico")
      .update({
        forma_pagamento: input.formaPagamento,
        data_pagamento: input.data,
        tipo_cartao: isCartao ? input.tipoCartao ?? null : null,
        valor_pago_bruto: isCartao ? input.valor : null,
        valor_recebido_liquido: isCartao ? input.valorRecebidoLiquido ?? null : null,
      })
      .eq("id", osId);
  }

  revalidatePath(`/ordens-servico/${osId}`);
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}

// Remove um pagamento lançado errado. Se isso derrubar o total pago abaixo
// do valor da OS, os campos legados de pagamento são limpos — a OS volta a
// aparecer como não quitada no Financeiro até um novo pagamento fechar a
// conta.
export async function deleteOsPagamento(id: string, osId: string) {
  const { error } = await supabase.from("os_pagamentos").delete().eq("id", id);
  if (error) throw new Error(error.message);

  const { total, totalPago } = await getOsTotais(osId);
  if (totalPago < total - 0.001) {
    await supabase
      .from("ordens_servico")
      .update({
        forma_pagamento: null,
        data_pagamento: null,
        tipo_cartao: null,
        valor_pago_bruto: null,
        valor_recebido_liquido: null,
      })
      .eq("id", osId);
  }

  revalidatePath(`/ordens-servico/${osId}`);
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}

export async function setOrdemServicoRetirada(id: string, dataRetirada: string) {
  const { error } = await supabase.from("ordens_servico").update({ data_retirada: dataRetirada }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/ordens-servico/${id}`);
  revalidatePath("/garantias");
}

// Reabre uma OS finalizada ou cancelada: volta para "aguardando pagamento" e
// limpa os pagamentos registrados (para corrigir um lançamento e registrar
// de novo). data_finalizacao é mantida de propósito — é o sinal de que essa
// OS já foi finalizada antes e precisa ser avisado na tela.
export async function reabrirOrdemServico(id: string) {
  const { error } = await supabase
    .from("ordens_servico")
    .update({
      status: "aguardando_pagamento" as OsStatus,
      forma_pagamento: null,
      data_pagamento: null,
      tipo_cartao: null,
      valor_pago_bruto: null,
      valor_recebido_liquido: null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await supabase.from("os_pagamentos").delete().eq("os_id", id);
  revalidatePath("/financeiro");
  revalidatePath("/ordens-servico");
  revalidatePath(`/ordens-servico/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/garantias");
}

export async function addOsItem(osId: string, formData: FormData) {
  const descricao = strUp(formData, "descricao");
  if (!descricao) throw new Error("Descrição é obrigatória");
  const pecaId = str(formData, "peca_id");
  const origem = (str(formData, "origem") as ItemOrigem) ?? "estoque";
  const lojaParceiraId = str(formData, "loja_parceira_id");
  if (origem === "loja_parceira" && !lojaParceiraId) throw new Error("Selecione a loja parceira");

  const quantidade = Number(str(formData, "quantidade") ?? "1");
  const valorUnitario = num(formData, "valor_unitario");
  const custoUnitario = origem === "compra_emergencial" ? num(formData, "custo_unitario") : null;

  const { data: item, error } = await supabase
    .from("os_itens")
    .insert({
      os_id: osId,
      peca_id: pecaId,
      loja_parceira_id: origem === "loja_parceira" ? lojaParceiraId : null,
      descricao,
      origem,
      quantidade,
      valor_unitario: valorUnitario,
      custo_unitario: custoUnitario,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  if (pecaId && origem === "estoque") {
    const { data: peca } = await supabase.from("pecas").select("quantidade").eq("id", pecaId).single();
    if (peca) {
      await supabase
        .from("pecas")
        .update({ quantidade: Math.max(0, peca.quantidade - quantidade) })
        .eq("id", pecaId);
    }
  }

  // Compra emergencial: o dinheiro já sai do caixa na hora da compra, antes
  // do cliente pagar a OS — então gera a despesa automaticamente aqui, pelo
  // custo real. O valor repassado ao cliente (valor_unitario) segue compondo
  // o total da OS normalmente; a margem entre os dois aparece sozinha no
  // Financeiro quando o cliente pagar, sem lançamento duplicado.
  if (origem === "compra_emergencial") {
    const { data: os } = await supabase.from("ordens_servico").select("numero").eq("id", osId).single();
    const numeroOs = os ? `OS #OS-${String(os.numero).padStart(4, "0")}` : "OS";
    const { error: despesaError } = await supabase.from("financeiro_despesas").insert({
      descricao: `COMPRA EMERGENCIAL - ${descricao} (${numeroOs})`,
      categoria: "Compra Emergencial",
      valor: quantidade * (custoUnitario ?? 0),
      os_item_id: item.id,
    });
    if (despesaError) throw new Error(`Item adicionado, mas a despesa não foi lançada: ${despesaError.message}`);
    revalidatePath("/financeiro");
  }

  revalidatePath(`/ordens-servico/${osId}`);
  revalidatePath("/estoque");
}

export async function updateOsItem(itemId: string, osId: string, formData: FormData) {
  const descricao = strUp(formData, "descricao");
  if (!descricao) throw new Error("Descrição é obrigatória");
  const quantidade = Number(str(formData, "quantidade") ?? "1");
  const valorUnitario = num(formData, "valor_unitario");

  const { data: itemAtual, error: itemError } = await supabase
    .from("os_itens")
    .select("origem, peca_id, quantidade, custo_unitario")
    .eq("id", itemId)
    .single();
  if (itemError) throw new Error(itemError.message);

  const custoUnitario = itemAtual.origem === "compra_emergencial" ? num(formData, "custo_unitario") : itemAtual.custo_unitario;

  const { error } = await supabase
    .from("os_itens")
    .update({ descricao, quantidade, valor_unitario: valorUnitario, custo_unitario: custoUnitario })
    .eq("id", itemId);
  if (error) throw new Error(error.message);

  // Corrige o estoque pela diferença entre a quantidade antiga e a nova.
  if (itemAtual.origem === "estoque" && itemAtual.peca_id) {
    const diferenca = itemAtual.quantidade - quantidade;
    if (diferenca !== 0) {
      const { data: peca } = await supabase.from("pecas").select("quantidade").eq("id", itemAtual.peca_id).single();
      if (peca) {
        await supabase
          .from("pecas")
          .update({ quantidade: Math.max(0, peca.quantidade + diferenca) })
          .eq("id", itemAtual.peca_id);
      }
    }
  }

  // Mantém a despesa da compra emergencial em dia com o novo custo.
  if (itemAtual.origem === "compra_emergencial") {
    await supabase
      .from("financeiro_despesas")
      .update({ valor: quantidade * (custoUnitario ?? 0) })
      .eq("os_item_id", itemId);
    revalidatePath("/financeiro");
  }

  revalidatePath(`/ordens-servico/${osId}`);
  revalidatePath("/estoque");
}

export async function removeOsItem(itemId: string, osId: string) {
  const { error } = await supabase.from("os_itens").delete().eq("id", itemId);
  if (error) throw new Error(error.message);
  revalidatePath(`/ordens-servico/${osId}`);
}

// ---------- Mão de obra descrita ----------
async function recalcularMaoObraOs(osId: string) {
  const { data: itens, error } = await supabase.from("os_mao_obra_itens").select("valor").eq("os_id", osId);
  if (error) throw new Error(error.message);
  const total = (itens ?? []).reduce((acc, i) => acc + i.valor, 0);
  const { error: updateError } = await supabase.from("ordens_servico").update({ valor_mao_obra: total }).eq("id", osId);
  if (updateError) throw new Error(updateError.message);
}

export async function addOsMaoObraItem(osId: string, formData: FormData) {
  const descricao = strUp(formData, "descricao");
  if (!descricao) throw new Error("Descrição é obrigatória");
  const valor = num(formData, "valor");

  const { error } = await supabase.from("os_mao_obra_itens").insert({ os_id: osId, descricao, valor });
  if (error) throw new Error(error.message);

  await recalcularMaoObraOs(osId);
  revalidatePath(`/ordens-servico/${osId}`);
  revalidatePath("/ordens-servico");
  revalidatePath("/dashboard");
}

export async function removeOsMaoObraItem(itemId: string, osId: string) {
  const { error } = await supabase.from("os_mao_obra_itens").delete().eq("id", itemId);
  if (error) throw new Error(error.message);

  await recalcularMaoObraOs(osId);
  revalidatePath(`/ordens-servico/${osId}`);
  revalidatePath("/ordens-servico");
  revalidatePath("/dashboard");
}

// ---------- Fretes ----------
export async function createPrestadorFrete(formData: FormData) {
  const nome = strUp(formData, "nome");
  if (!nome) throw new Error("Nome é obrigatório");
  const { data, error } = await supabase
    .from("prestadores_frete")
    .insert({ nome, telefone: str(formData, "telefone") })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/ordens-servico");
  revalidatePath("/financeiro");
  return data.id as string;
}

export async function addFrete(osId: string, formData: FormData) {
  const prestadorId = str(formData, "prestador_id");
  const tipo = (str(formData, "tipo") as FreteTipo | null) ?? "entrega";
  const { error } = await supabase.from("fretes").insert({
    os_id: osId,
    prestador_id: prestadorId,
    valor_custo: num(formData, "valor_custo"),
    tipo,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/ordens-servico/${osId}`);
  revalidatePath("/financeiro");
}

export async function marcarFretePago(freteId: string, osId: string) {
  const { error } = await supabase
    .from("fretes")
    .update({ status: "pago" as FreteStatus, data_pagamento: new Date().toISOString().slice(0, 10) })
    .eq("id", freteId);
  if (error) throw new Error(error.message);
  revalidatePath(`/ordens-servico/${osId}`);
  revalidatePath("/financeiro");
}

export async function deleteFrete(freteId: string, osId: string) {
  const { error } = await supabase.from("fretes").delete().eq("id", freteId);
  if (error) throw new Error(error.message);
  revalidatePath(`/ordens-servico/${osId}`);
  revalidatePath("/financeiro");
}

// ---------- Estoque ----------
export async function createPeca(formData: FormData) {
  const nome = strUp(formData, "nome");
  if (!nome) throw new Error("Nome é obrigatório");
  const { error } = await supabase.from("pecas").insert({
    nome,
    codigo: strUp(formData, "codigo"),
    categoria: strUp(formData, "categoria"),
    quantidade: Number(str(formData, "quantidade") ?? "0"),
    quantidade_minima: Number(str(formData, "quantidade_minima") ?? "2"),
    preco_custo: num(formData, "preco_custo"),
    preco_venda: num(formData, "preco_venda"),
    fornecedor_id: str(formData, "fornecedor_id"),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/estoque");
}

export async function updatePeca(id: string, formData: FormData) {
  const nome = strUp(formData, "nome");
  if (!nome) throw new Error("Nome é obrigatório");
  const { error } = await supabase
    .from("pecas")
    .update({
      nome,
      codigo: strUp(formData, "codigo"),
      categoria: strUp(formData, "categoria"),
      quantidade: Number(str(formData, "quantidade") ?? "0"),
      quantidade_minima: Number(str(formData, "quantidade_minima") ?? "2"),
      preco_custo: num(formData, "preco_custo"),
      preco_venda: num(formData, "preco_venda"),
      fornecedor_id: str(formData, "fornecedor_id"),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/estoque");
}

export interface BalancoEstoqueItemInput {
  pecaId: string;
  pecaNome: string;
  pecaCodigo: string | null;
  quantidadeSistema: number;
  quantidadeContada: number;
}

export async function criarBalancoEstoque(itens: BalancoEstoqueItemInput[], observacao?: string | null) {
  if (itens.length === 0) throw new Error("Conte ao menos um item para salvar o balanço");

  const { data: balanco, error: balancoError } = await supabase
    .from("balancos_estoque")
    .insert({ observacao: observacao?.trim() || null })
    .select("id")
    .single();
  if (balancoError) throw new Error(balancoError.message);

  const linhas = itens.map((item) => ({
    balanco_id: balanco.id,
    peca_id: item.pecaId,
    peca_nome: item.pecaNome,
    peca_codigo: item.pecaCodigo,
    quantidade_sistema: item.quantidadeSistema,
    quantidade_contada: item.quantidadeContada,
    diferenca: item.quantidadeContada - item.quantidadeSistema,
  }));
  const { error: itensError } = await supabase.from("balanco_estoque_itens").insert(linhas);
  if (itensError) throw new Error(itensError.message);

  const atualizacoes = await Promise.all(
    itens.map((item) => supabase.from("pecas").update({ quantidade: item.quantidadeContada }).eq("id", item.pecaId))
  );
  const erroAtualizacao = atualizacoes.find((r) => r.error);
  if (erroAtualizacao?.error) throw new Error(erroAtualizacao.error.message);

  revalidatePath("/estoque");
  revalidatePath("/estoque/balanco");
  revalidatePath("/dashboard");
  return balanco.id as string;
}

export interface EntradaEstoqueItemInput {
  peca_id: string | null;
  novaPeca?: { nome: string; codigo: string | null; categoria: string | null };
  quantidade: number;
  valor_unitario: number;
}

export interface EntradaEstoqueParcelaInput {
  vencimento: string;
  valor: number;
}

export async function createEntradaEstoque(input: {
  lojaId: string | null;
  lojaNome: string | null;
  numeroNf: string | null;
  dataNf: string;
  dataChegada: string | null;
  valorTotal: number;
  observacoes: string | null;
  itens: EntradaEstoqueItemInput[];
  parcelas: EntradaEstoqueParcelaInput[];
}) {
  if (!input.dataNf) throw new Error("Data da NF é obrigatória");
  if (input.itens.length === 0) throw new Error("Adicione ao menos um item recebido");

  const { data: entrada, error } = await supabase
    .from("entradas_estoque")
    .insert({
      loja_id: input.lojaId,
      numero_nf: input.numeroNf,
      data_nf: input.dataNf,
      data_chegada: input.dataChegada,
      valor_total: input.valorTotal,
      observacoes: input.observacoes,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  for (const item of input.itens) {
    let pecaId = item.peca_id;
    if (!pecaId && item.novaPeca?.nome) {
      const { data: novaPeca, error: pecaError } = await supabase
        .from("pecas")
        .insert({
          nome: item.novaPeca.nome,
          codigo: item.novaPeca.codigo,
          categoria: item.novaPeca.categoria,
          preco_custo: item.valor_unitario,
          fornecedor_id: input.lojaId,
          quantidade: 0,
        })
        .select("id")
        .single();
      if (pecaError) throw new Error(pecaError.message);
      pecaId = novaPeca.id as string;
    }
    if (!pecaId) continue;

    const { error: itemError } = await supabase.from("entrada_estoque_itens").insert({
      entrada_id: entrada.id,
      peca_id: pecaId,
      quantidade: item.quantidade,
      valor_unitario: item.valor_unitario,
    });
    if (itemError) throw new Error(itemError.message);

    const { data: peca } = await supabase.from("pecas").select("quantidade").eq("id", pecaId).single();
    if (peca) {
      await supabase
        .from("pecas")
        .update({ quantidade: peca.quantidade + item.quantidade })
        .eq("id", pecaId);
    }
  }

  if (input.parcelas.length > 0) {
    const totalParcelas = input.parcelas.length;
    const descricao = `NF ${input.numeroNf ?? "s/ nº"}${input.lojaNome ? ` - ${input.lojaNome}` : ""}`.toUpperCase();
    const linhas = input.parcelas.map((p, i) => ({
      descricao,
      categoria: "PEÇAS",
      fornecedor: input.lojaNome,
      numero_documento: input.numeroNf,
      valor: p.valor,
      vencimento: p.vencimento,
      parcela_atual: totalParcelas > 1 ? i + 1 : null,
      parcela_total: totalParcelas > 1 ? totalParcelas : null,
      entrada_estoque_id: entrada.id,
    }));
    const { error: contasError } = await supabase.from("financeiro_contas").insert(linhas);
    if (contasError) throw new Error(contasError.message);
  }

  revalidatePath("/estoque");
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
  return entrada.id as string;
}

export async function createLojaParceira(formData: FormData) {
  const nome = strUp(formData, "nome");
  if (!nome) throw new Error("Nome é obrigatório");
  const { data, error } = await supabase
    .from("lojas_parceiras")
    .insert({
      nome,
      especialidade: strUp(formData, "especialidade"),
      telefone: str(formData, "telefone"),
      tempo_entrega: strUp(formData, "tempo_entrega"),
      desconto_percentual: num(formData, "desconto_percentual"),
      cnpj: str(formData, "cnpj"),
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/estoque");
  return data.id as string;
}

export async function updateLojaParceira(id: string, formData: FormData) {
  const nome = strUp(formData, "nome");
  if (!nome) throw new Error("Nome é obrigatório");
  const { error } = await supabase
    .from("lojas_parceiras")
    .update({
      nome,
      especialidade: strUp(formData, "especialidade"),
      telefone: str(formData, "telefone"),
      tempo_entrega: strUp(formData, "tempo_entrega"),
      desconto_percentual: num(formData, "desconto_percentual"),
      cnpj: str(formData, "cnpj"),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/estoque");
  revalidatePath("/financeiro");
}

// ---------- PDV ----------
export interface PdvItemInput {
  peca_id: string | null;
  descricao: string;
  tipo: "peca" | "servico";
  quantidade: number;
  valor_unitario: number;
}

export interface PdvPagamentoInput {
  forma_pagamento: FormaPagamento;
  valor: number;
}

export async function finalizarVendaPdv(input: {
  clienteId: string | null;
  clienteNomeAvulso: string | null;
  pagamentos: PdvPagamentoInput[];
  desconto: number;
  itens: PdvItemInput[];
}) {
  const subtotal = input.itens.reduce((acc, i) => acc + i.quantidade * i.valor_unitario, 0);
  const total = Math.max(0, subtotal - input.desconto);

  if (input.pagamentos.length === 0) throw new Error("Selecione ao menos uma forma de pagamento");
  const totalPago = input.pagamentos.reduce((acc, p) => acc + p.valor, 0);
  if (Math.abs(totalPago - total) > 0.01) {
    throw new Error("A soma das formas de pagamento precisa bater com o total da venda");
  }

  const { data: venda, error } = await supabase
    .from("vendas_pdv")
    .insert({
      cliente_id: input.clienteId,
      cliente_nome_avulso: input.clienteNomeAvulso ? input.clienteNomeAvulso.toUpperCase() : input.clienteNomeAvulso,
      forma_pagamento: input.pagamentos[0].forma_pagamento,
      subtotal,
      desconto: input.desconto,
      total,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const { error: pagamentosError } = await supabase.from("venda_pagamentos").insert(
    input.pagamentos.map((p) => ({
      venda_id: venda.id,
      forma_pagamento: p.forma_pagamento,
      valor: p.valor,
    }))
  );
  if (pagamentosError) throw new Error(pagamentosError.message);

  if (input.itens.length > 0) {
    const { error: itensError } = await supabase.from("venda_itens").insert(
      input.itens.map((i) => ({
        venda_id: venda.id,
        peca_id: i.peca_id,
        descricao: i.descricao,
        tipo: i.tipo,
        quantidade: i.quantidade,
        valor_unitario: i.valor_unitario,
      }))
    );
    if (itensError) throw new Error(itensError.message);
  }

  for (const item of input.itens) {
    if (item.peca_id && item.tipo === "peca") {
      const { data: peca } = await supabase.from("pecas").select("quantidade").eq("id", item.peca_id).single();
      if (peca) {
        await supabase
          .from("pecas")
          .update({ quantidade: Math.max(0, peca.quantidade - item.quantidade) })
          .eq("id", item.peca_id);
      }
    }
  }

  revalidatePath("/pdv");
  revalidatePath("/estoque");
  return venda.id as string;
}

// ---------- Financeiro ----------
function addMeses(dataISO: string, meses: number): string {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  return new Date(Date.UTC(ano, mes - 1 + meses, dia)).toISOString().slice(0, 10);
}

export async function createContaPagar(formData: FormData) {
  const descricao = strUp(formData, "descricao");
  const vencimento = str(formData, "vencimento");
  if (!descricao || !vencimento) throw new Error("Descrição e vencimento são obrigatórios");

  const categoria = strUp(formData, "categoria");
  const fornecedor = strUp(formData, "fornecedor");
  const numero_documento = strUp(formData, "numero_documento");
  const valor = num(formData, "valor");
  const totalParcelas = Math.max(1, Number(str(formData, "parcelas") ?? "1"));

  const linhas = Array.from({ length: totalParcelas }, (_, i) => ({
    descricao,
    categoria,
    fornecedor,
    numero_documento,
    valor,
    vencimento: addMeses(vencimento, i),
    parcela_atual: totalParcelas > 1 ? i + 1 : null,
    parcela_total: totalParcelas > 1 ? totalParcelas : null,
  }));

  const { error } = await supabase.from("financeiro_contas").insert(linhas);
  if (error) throw new Error(error.message);
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}

export async function updateContaPagar(id: string, formData: FormData) {
  const descricao = strUp(formData, "descricao");
  const vencimento = str(formData, "vencimento");
  if (!descricao || !vencimento) throw new Error("Descrição e vencimento são obrigatórios");

  const { error } = await supabase
    .from("financeiro_contas")
    .update({
      descricao,
      categoria: strUp(formData, "categoria"),
      fornecedor: strUp(formData, "fornecedor"),
      numero_documento: strUp(formData, "numero_documento"),
      valor: num(formData, "valor"),
      vencimento,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}

export async function marcarContaPaga(id: string) {
  const { error } = await supabase
    .from("financeiro_contas")
    .update({ status: "pago", pago_em: new Date().toISOString().slice(0, 10) })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}

export async function deleteContaPagar(id: string) {
  const { error } = await supabase
    .from("financeiro_contas")
    .update({ deletado_em: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
  revalidatePath("/configuracoes/lixeira");
}

export async function restaurarContaPagar(id: string) {
  const { error } = await supabase.from("financeiro_contas").update({ deletado_em: null }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
  revalidatePath("/configuracoes/lixeira");
}

export async function createDespesa(formData: FormData) {
  const descricao = strUp(formData, "descricao");
  if (!descricao) throw new Error("Descrição é obrigatória");
  const { error } = await supabase.from("financeiro_despesas").insert({
    descricao,
    categoria: strUp(formData, "categoria"),
    valor: num(formData, "valor"),
    data: str(formData, "data") ?? new Date().toISOString().slice(0, 10),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/financeiro");
}

export async function deleteDespesa(id: string) {
  const { data: despesa } = await supabase.from("financeiro_despesas").select("os_item_id").eq("id", id).single();
  const { error } = await supabase
    .from("financeiro_despesas")
    .update({ deletado_em: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  // Se essa despesa foi gerada automaticamente por uma compra emergencial,
  // exclui também o item correspondente na OS — senão o item continua lá,
  // cobrado do cliente, sem mais nenhum registro do custo que ele teve.
  if (despesa?.os_item_id) {
    await supabase.from("os_itens").delete().eq("id", despesa.os_item_id);
  }

  revalidatePath("/financeiro");
  revalidatePath("/configuracoes/lixeira");
  revalidatePath("/ordens-servico");
}

export async function restaurarDespesa(id: string) {
  const { error } = await supabase.from("financeiro_despesas").update({ deletado_em: null }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/financeiro");
  revalidatePath("/configuracoes/lixeira");
}

export async function createRetirada(formData: FormData) {
  const descricao = strUp(formData, "descricao");
  if (!descricao) throw new Error("Descrição é obrigatória");
  const { error } = await supabase.from("financeiro_retiradas").insert({
    tipo: (str(formData, "tipo") as RetiradaTipo) ?? "outro",
    descricao,
    valor: num(formData, "valor"),
    data: str(formData, "data") ?? new Date().toISOString().slice(0, 10),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/financeiro");
}

export async function deleteRetirada(id: string) {
  const { error } = await supabase
    .from("financeiro_retiradas")
    .update({ deletado_em: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/financeiro");
  revalidatePath("/configuracoes/lixeira");
}

export async function restaurarRetirada(id: string) {
  const { error } = await supabase.from("financeiro_retiradas").update({ deletado_em: null }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/financeiro");
  revalidatePath("/configuracoes/lixeira");
}

// Ajuste manual do saldo em caixa — usado para reconciliar o saldo que o
// sistema calcula (a partir do que foi lançado) com o caixa físico real,
// por exemplo o saldo que já existia antes de começar a usar o SIGO.
export async function createAjusteCaixa(formData: FormData) {
  const descricao = strUp(formData, "descricao");
  if (!descricao) throw new Error("Descrição é obrigatória");
  const tipo = str(formData, "tipo") ?? "entrada";
  const valorAbsoluto = num(formData, "valor");
  const { error } = await supabase.from("financeiro_ajustes_caixa").insert({
    descricao,
    valor: tipo === "saida" ? -valorAbsoluto : valorAbsoluto,
    data: str(formData, "data") ?? new Date().toISOString().slice(0, 10),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}

export async function deleteAjusteCaixa(id: string) {
  const { error } = await supabase
    .from("financeiro_ajustes_caixa")
    .update({ deletado_em: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
  revalidatePath("/configuracoes/lixeira");
}

export async function restaurarAjusteCaixa(id: string) {
  const { error } = await supabase.from("financeiro_ajustes_caixa").update({ deletado_em: null }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
  revalidatePath("/configuracoes/lixeira");
}

// Fecha a conta corrente com um parceiro que não emite boleto/NF: soma
// todos os itens de OS ainda pendentes dessa loja, lança a retirada
// correspondente e marca os itens como pagos.
interface ItemParceiroCandidato {
  id: string;
  quantidade: number;
  valor_unitario: number;
  ordens_servico: { forma_pagamento: string | null } | null;
}

export async function fecharContaParceiro(lojaParceiraId: string) {
  const [{ data: loja }, { data: itensCandidatos }] = await Promise.all([
    supabase.from("lojas_parceiras").select("nome").eq("id", lojaParceiraId).single(),
    supabase
      .from("os_itens")
      .select<string, ItemParceiroCandidato>("id, quantidade, valor_unitario, ordens_servico(forma_pagamento)")
      .eq("origem", "loja_parceira")
      .eq("loja_parceira_id", lojaParceiraId)
      .is("pago_em", null),
  ]);
  if (!loja) throw new Error("Loja parceira não encontrada");

  // Só fecha itens de OS que o cliente já pagou — o resto continua pendente.
  const itensPendentes = (itensCandidatos ?? []).filter((item) => item.ordens_servico?.forma_pagamento != null);
  if (itensPendentes.length === 0) throw new Error("Nada pendente com essa loja (em OS já pagas pelo cliente)");

  const total = itensPendentes.reduce((acc, item) => acc + item.quantidade * item.valor_unitario, 0);
  const agora = new Date().toISOString();

  const { error: retiradaError } = await supabase.from("financeiro_retiradas").insert({
    tipo: "pagamento_parceiro",
    descricao: `Pagamento de peças - ${loja.nome}`,
    loja_parceira_id: lojaParceiraId,
    valor: total,
    data: agora.slice(0, 10),
  });
  if (retiradaError) throw new Error(retiradaError.message);

  const { error: itensError } = await supabase
    .from("os_itens")
    .update({ pago_em: agora })
    .in("id", itensPendentes.map((item) => item.id));
  if (itensError) throw new Error(itensError.message);

  revalidatePath("/financeiro");
}

// Fecha a conta com uma empresa autorizada (PRAXIS, IPC, ...): lança um
// pagamento de mão de obra em cada OS finalizada e ainda não paga dessa
// autorizada, do mesmo jeito que um pagamento normal (ver
// registrarPagamentoOs) — assim elas passam a aparecer como entrada no
// Financeiro sem precisar registrar OS por OS.
interface OsAutorizadaCandidata {
  id: string;
  valor_mao_obra: number;
  valor_frete: number;
  desconto: number;
}

export async function fecharContaAutorizada(empresaAutorizadaId: string) {
  const [{ data: empresa }, { data: osCandidatas }] = await Promise.all([
    supabase.from("empresas_autorizadas").select("nome").eq("id", empresaAutorizadaId).single(),
    supabase
      .from("ordens_servico")
      .select<string, OsAutorizadaCandidata>("id, valor_mao_obra, valor_frete, desconto")
      .eq("empresa_autorizada_id", empresaAutorizadaId)
      .eq("status", "finalizado")
      .is("forma_pagamento", null),
  ]);
  if (!empresa) throw new Error("Empresa autorizada não encontrada");
  if (!osCandidatas || osCandidatas.length === 0) throw new Error("Nada pendente com essa autorizada");

  const agora = new Date().toISOString().slice(0, 10);
  let algumaFechada = false;

  for (const os of osCandidatas) {
    const { total, totalPago } = await getOsTotais(os.id);
    const saldoDevedor = total - totalPago;
    if (saldoDevedor <= 0.001) continue;
    algumaFechada = true;

    const { error: pagamentoError } = await supabase.from("os_pagamentos").insert({
      os_id: os.id,
      forma_pagamento: "autorizada",
      valor: saldoDevedor,
      data: agora,
    });
    if (pagamentoError) throw new Error(pagamentoError.message);

    const { error: osError } = await supabase
      .from("ordens_servico")
      .update({ forma_pagamento: "autorizada", data_pagamento: agora })
      .eq("id", os.id);
    if (osError) throw new Error(osError.message);
  }

  if (!algumaFechada) throw new Error("Nada pendente com essa autorizada");

  revalidatePath("/financeiro");
  revalidatePath("/ordens-servico");
  revalidatePath("/dashboard");
}

export interface VendaDetalhes {
  numero: number;
  createdAt: string;
  cliente: string;
  subtotal: number;
  desconto: number;
  total: number;
  itens: { descricao: string; tipo: "peca" | "servico"; quantidade: number; valorUnitario: number }[];
  pagamentos: { formaPagamento: FormaPagamento; valor: number }[];
}

interface VendaRow {
  numero: number;
  created_at: string;
  subtotal: number;
  desconto: number;
  total: number;
  cliente_nome_avulso: string | null;
  clientes: { nome: string } | null;
}

export async function getVendaDetalhes(id: string): Promise<VendaDetalhes> {
  const [{ data: venda, error }, { data: itens }, { data: pagamentos }] = await Promise.all([
    supabase
      .from("vendas_pdv")
      .select<string, VendaRow>("numero, created_at, subtotal, desconto, total, cliente_nome_avulso, clientes(nome)")
      .eq("id", id)
      .single(),
    supabase.from("venda_itens").select("descricao, tipo, quantidade, valor_unitario").eq("venda_id", id),
    supabase.from("venda_pagamentos").select("forma_pagamento, valor").eq("venda_id", id),
  ]);
  if (error || !venda) throw new Error("Venda não encontrada");

  return {
    numero: venda.numero,
    createdAt: venda.created_at,
    cliente: venda.clientes?.nome ?? venda.cliente_nome_avulso ?? "Cliente avulso",
    subtotal: venda.subtotal,
    desconto: venda.desconto,
    total: venda.total,
    itens: (itens ?? []).map((i) => ({
      descricao: i.descricao,
      tipo: i.tipo,
      quantidade: i.quantidade,
      valorUnitario: i.valor_unitario,
    })),
    pagamentos: (pagamentos ?? []).map((p) => ({ formaPagamento: p.forma_pagamento, valor: p.valor })),
  };
}

export interface OsDetalhes {
  numero: number;
  status: OsStatus;
  cliente: string;
  equipamentoDescricao: string;
  problemaRelatado: string;
  data: string;
  formaPagamento: string | null;
  itens: { descricao: string; quantidade: number; valorUnitario: number }[];
  valorMaoObra: number;
  valorFrete: number;
  desconto: number;
  total: number;
}

interface OsDetalhesRow {
  numero: number;
  status: OsStatus;
  data_entrada: string;
  data_finalizacao: string | null;
  data_pagamento: string | null;
  problema_relatado: string | null;
  forma_pagamento: FormaPagamento | null;
  valor_mao_obra: number;
  valor_frete: number;
  desconto: number;
  clientes: { nome: string } | null;
  equipamentos: { tipo: string; marca: string | null; modelo: string | null } | null;
}

export async function getOsDetalhes(id: string): Promise<OsDetalhes> {
  const [{ data: os, error }, { data: itens }] = await Promise.all([
    supabase
      .from("ordens_servico")
      .select<string, OsDetalhesRow>(
        "numero, status, data_entrada, data_finalizacao, data_pagamento, problema_relatado, forma_pagamento, valor_mao_obra, valor_frete, desconto, clientes(nome), equipamentos(tipo, marca, modelo)"
      )
      .eq("id", id)
      .single(),
    supabase.from("os_itens").select("descricao, quantidade, valor_unitario").eq("os_id", id),
  ]);
  if (error || !os) throw new Error("Ordem de serviço não encontrada");

  const totalItens = (itens ?? []).reduce((acc, i) => acc + i.quantidade * i.valor_unitario, 0);

  return {
    numero: os.numero,
    status: os.status,
    cliente: os.clientes?.nome ?? "Cliente não informado",
    equipamentoDescricao: os.equipamentos
      ? [os.equipamentos.marca, os.equipamentos.modelo].filter(Boolean).join(" ") || os.equipamentos.tipo
      : "Equipamento não informado",
    problemaRelatado: os.problema_relatado || "Sem descrição do problema",
    data: os.data_pagamento ?? os.data_finalizacao ?? os.data_entrada,
    formaPagamento: os.forma_pagamento,
    itens: (itens ?? []).map((i) => ({
      descricao: i.descricao,
      quantidade: i.quantidade,
      valorUnitario: i.valor_unitario,
    })),
    valorMaoObra: os.valor_mao_obra,
    valorFrete: os.valor_frete,
    desconto: os.desconto,
    total: Math.max(0, totalItens + os.valor_mao_obra + os.valor_frete - os.desconto),
  };
}

export async function deleteVendaPdv(id: string) {
  const { error } = await supabase
    .from("vendas_pdv")
    .update({ deletado_em: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/financeiro");
  revalidatePath("/pdv");
  revalidatePath("/dashboard");
  revalidatePath("/configuracoes/lixeira");
}

export async function restaurarVendaPdv(id: string) {
  const { error } = await supabase.from("vendas_pdv").update({ deletado_em: null }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/financeiro");
  revalidatePath("/pdv");
  revalidatePath("/dashboard");
  revalidatePath("/configuracoes/lixeira");
}

// ---------- Agenda ----------
export async function createAgendaEvento(formData: FormData) {
  const titulo = strUp(formData, "titulo");
  const data = str(formData, "data");
  const hora = str(formData, "hora") ?? "09:00";
  if (!titulo || !data) throw new Error("Título e data são obrigatórios");
  const { error } = await supabase.from("agenda_eventos").insert({
    titulo,
    tipo: (str(formData, "tipo") as AgendaTipo) ?? "oficina",
    cliente_id: str(formData, "cliente_id"),
    endereco: strUp(formData, "endereco"),
    data_hora_inicio: new Date(`${data}T${hora}`).toISOString(),
    tecnico: strUp(formData, "tecnico"),
    observacoes: strUp(formData, "observacoes"),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/agenda");
  revalidatePath("/dashboard");
}

export async function updateAgendaEvento(id: string, formData: FormData) {
  const titulo = strUp(formData, "titulo");
  const data = str(formData, "data");
  const hora = str(formData, "hora") ?? "09:00";
  if (!titulo || !data) throw new Error("Título e data são obrigatórios");
  const { error } = await supabase
    .from("agenda_eventos")
    .update({
      titulo,
      tipo: (str(formData, "tipo") as AgendaTipo) ?? "oficina",
      cliente_id: str(formData, "cliente_id"),
      endereco: strUp(formData, "endereco"),
      data_hora_inicio: new Date(`${data}T${hora}`).toISOString(),
      status: (str(formData, "status") as AgendaStatus) ?? "agendado",
      tecnico: strUp(formData, "tecnico"),
      observacoes: strUp(formData, "observacoes"),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/agenda");
  revalidatePath("/dashboard");
}

export async function updateAgendaStatus(id: string, status: AgendaStatus) {
  const { error } = await supabase.from("agenda_eventos").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/agenda");
  revalidatePath("/dashboard");
}

// ---------- Tarefas ----------
export async function createTarefa(formData: FormData) {
  const titulo = strUp(formData, "titulo");
  if (!titulo) throw new Error("Título é obrigatório");
  const { error } = await supabase.from("tarefas").insert({ titulo });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function toggleTarefa(id: string, concluida: boolean) {
  const { error } = await supabase.from("tarefas").update({ concluida }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

// ---------- Configurações ----------
export async function updateConfiguracoesEmpresa(formData: FormData) {
  const { error } = await supabase
    .from("configuracoes")
    .update({
      nome_empresa: str(formData, "nome_empresa") ?? "Minha Oficina",
      cnpj: str(formData, "cnpj"),
      telefone: str(formData, "telefone"),
      endereco: str(formData, "endereco"),
    })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/configuracoes");
}

export async function uploadLogoEmpresa(formData: FormData) {
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) throw new Error("Selecione uma imagem");
  if (!file.type.startsWith("image/")) throw new Error("O arquivo precisa ser uma imagem");
  if (file.size > 2 * 1024 * 1024) throw new Error("A imagem precisa ter no máximo 2MB");

  const extensao = file.name.split(".").pop()?.toLowerCase() || "png";
  const caminho = `empresa-logo.${extensao}`;

  const { error: uploadError } = await supabase.storage.from("logos").upload(caminho, file, {
    upsert: true,
    contentType: file.type,
  });
  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrlData } = supabase.storage.from("logos").getPublicUrl(caminho);
  const logoUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

  const { error } = await supabase.from("configuracoes").update({ logo_url: logoUrl }).eq("id", 1);
  if (error) throw new Error(error.message);

  revalidatePath("/configuracoes");
  revalidatePath("/garantias/configuracoes");
  revalidatePath("/orcamentos", "layout");
  return logoUrl;
}

export async function uploadLogoEtiqueta(formData: FormData) {
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) throw new Error("Selecione uma imagem");
  if (!file.type.startsWith("image/")) throw new Error("O arquivo precisa ser uma imagem");
  if (file.size > 2 * 1024 * 1024) throw new Error("A imagem precisa ter no máximo 2MB");

  const extensao = file.name.split(".").pop()?.toLowerCase() || "png";
  const caminho = `etiqueta-logo.${extensao}`;

  const { error: uploadError } = await supabase.storage.from("logos").upload(caminho, file, {
    upsert: true,
    contentType: file.type,
  });
  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrlData } = supabase.storage.from("logos").getPublicUrl(caminho);
  const logoUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

  const { error } = await supabase.from("configuracoes").update({ etiqueta_logo_url: logoUrl }).eq("id", 1);
  if (error) throw new Error(error.message);

  revalidatePath("/configuracoes");
  return logoUrl;
}

export async function removerLogoEtiqueta() {
  const { error } = await supabase.from("configuracoes").update({ etiqueta_logo_url: null }).eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/configuracoes");
}

export async function updateConfiguracoesGarantia(formData: FormData) {
  const { error } = await supabase
    .from("configuracoes")
    .update({
      garantia_prazo_dias: Number(str(formData, "garantia_prazo_dias") ?? "90"),
      garantia_tipo_cobertura: str(formData, "garantia_tipo_cobertura") ?? "Garantia Total (Peças e Mão de Obra)",
      garantia_texto_padrao: str(formData, "garantia_texto_padrao"),
      garantia_alerta_dias: Number(str(formData, "garantia_alerta_dias") ?? "7"),
      garantia_assinatura_digital: formData.get("garantia_assinatura_digital") === "on",
      garantia_qrcode: formData.get("garantia_qrcode") === "on",
    })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/garantias/configuracoes");
}


export async function updateConfiguracoesDashboard(formData: FormData) {
  const { error } = await supabase
    .from("configuracoes")
    .update({
      dashboard_mostrar_stats: formData.get("dashboard_mostrar_stats") === "on",
      dashboard_mostrar_agenda: formData.get("dashboard_mostrar_agenda") === "on",
      dashboard_mostrar_os_paradas: formData.get("dashboard_mostrar_os_paradas") === "on",
      dashboard_mostrar_tarefas: formData.get("dashboard_mostrar_tarefas") === "on",
      dashboard_os_parada_dias: Number(str(formData, "dashboard_os_parada_dias") ?? "3"),
      dashboard_mostrar_pdv_hoje: formData.get("dashboard_mostrar_pdv_hoje") === "on",
      dashboard_mostrar_fretes_pendentes: formData.get("dashboard_mostrar_fretes_pendentes") === "on",
      dashboard_mostrar_garantias_vencendo: formData.get("dashboard_mostrar_garantias_vencendo") === "on",
      dashboard_mostrar_orcamentos_pendentes: formData.get("dashboard_mostrar_orcamentos_pendentes") === "on",
      dashboard_mostrar_boletos_pendentes: formData.get("dashboard_mostrar_boletos_pendentes") === "on",
      dashboard_boletos_dias: Number(str(formData, "dashboard_boletos_dias") ?? "3"),
    })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/configuracoes");
  revalidatePath("/dashboard");
}

// ---------- Orçamentos ----------
export async function createOrcamento(formData: FormData) {
  let clienteId = str(formData, "cliente_id");

  if (!clienteId) {
    const nome = strUp(formData, "cliente_nome");
    if (!nome) throw new Error("Informe o cliente");
    const { data: novoCliente, error: clienteError } = await supabase
      .from("clientes")
      .insert({ nome, telefone: str(formData, "cliente_telefone") })
      .select("id")
      .single();
    if (clienteError) throw new Error(clienteError.message);
    clienteId = novoCliente.id;
  }

  const validadeDias = Number(str(formData, "validade_dias") ?? "15");
  const dataValidade = new Date();
  dataValidade.setDate(dataValidade.getDate() + validadeDias);

  const { data: orcamento, error } = await supabase
    .from("orcamentos")
    .insert({
      cliente_id: clienteId,
      descricao: strUp(formData, "descricao"),
      data_validade: dataValidade.toISOString().slice(0, 10),
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/orcamentos");
  return orcamento.id as string;
}

export async function updateOrcamentoDetalhes(id: string, formData: FormData) {
  const { error } = await supabase
    .from("orcamentos")
    .update({
      descricao: strUp(formData, "descricao"),
      observacoes: strUp(formData, "observacoes"),
      desconto: num(formData, "desconto"),
      data_validade: str(formData, "data_validade") ?? undefined,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/orcamentos/${id}`);
}

export async function updateOrcamentoStatus(id: string, status: OrcamentoStatus) {
  const { error } = await supabase.from("orcamentos").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/orcamentos/${id}`);
  revalidatePath("/orcamentos");
}

export async function addOrcamentoItem(orcamentoId: string, formData: FormData) {
  const descricao = strUp(formData, "descricao");
  if (!descricao) throw new Error("Descrição é obrigatória");
  const { error } = await supabase.from("orcamento_itens").insert({
    orcamento_id: orcamentoId,
    descricao,
    tipo: (str(formData, "tipo") as OrcamentoItemTipo) ?? "peca",
    quantidade: Number(str(formData, "quantidade") ?? "1"),
    valor_unitario: num(formData, "valor_unitario"),
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/orcamentos/${orcamentoId}`);
}

export async function removeOrcamentoItem(itemId: string, orcamentoId: string) {
  const { error } = await supabase.from("orcamento_itens").delete().eq("id", itemId);
  if (error) throw new Error(error.message);
  revalidatePath(`/orcamentos/${orcamentoId}`);
}

export async function resetarSistema() {
  const tabelas = [
    "os_itens",
    "os_mao_obra_itens",
    "venda_itens",
    "vendas_pdv",
    "venda_pagamentos",
    "orcamento_itens",
    "orcamentos",
    "fretes",
    "prestadores_frete",
    "agenda_eventos",
    "financeiro_despesas",
    "financeiro_contas",
    "ordens_servico",
    "equipamentos",
    "balancos_estoque",
    "pecas",
    "lojas_parceiras",
    "clientes",
    "tarefas",
  ] as const;
  for (const tabela of tabelas) {
    await supabase.from(tabela).delete().not("id", "is", null);
  }
  revalidatePath("/", "layout");
}
