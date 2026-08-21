"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import type {
  Database,
  OsStatus,
  OsUrgencia,
  OsOrigem,
  FormaPagamento,
  ItemOrigem,
  AgendaTipo,
  AgendaStatus,
  OrcamentoStatus,
  OrcamentoItemTipo,
  FreteStatus,
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

// ---------- Clientes ----------
export async function createCliente(formData: FormData) {
  const nome = str(formData, "nome");
  if (!nome) throw new Error("Nome é obrigatório");
  const { data, error } = await supabase
    .from("clientes")
    .insert({
      nome,
      telefone: str(formData, "telefone"),
      email: str(formData, "email"),
      cpf_cnpj: str(formData, "cpf_cnpj"),
      endereco: str(formData, "endereco"),
      bairro: str(formData, "bairro"),
      cidade: str(formData, "cidade"),
      estado: str(formData, "estado"),
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/clientes");
  revalidatePath("/dashboard");
  return data.id as string;
}

export async function updateCliente(id: string, formData: FormData) {
  const nome = str(formData, "nome");
  if (!nome) throw new Error("Nome é obrigatório");
  const { error } = await supabase
    .from("clientes")
    .update({
      nome,
      telefone: str(formData, "telefone"),
      email: str(formData, "email"),
      cpf_cnpj: str(formData, "cpf_cnpj"),
      endereco: str(formData, "endereco"),
      bairro: str(formData, "bairro"),
      cidade: str(formData, "cidade"),
      estado: str(formData, "estado"),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/clientes");
}

export async function createEquipamento(clienteId: string, formData: FormData) {
  const tipo = str(formData, "tipo");
  if (!tipo) throw new Error("Tipo é obrigatório");
  const { error } = await supabase.from("equipamentos").insert({
    cliente_id: clienteId,
    tipo,
    marca: str(formData, "marca"),
    modelo: str(formData, "modelo"),
    numero_serie: str(formData, "numero_serie"),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/clientes");
}

// ---------- Ordens de Serviço ----------
export async function createOrdemServico(formData: FormData) {
  let clienteId = str(formData, "cliente_id");

  if (!clienteId) {
    const nome = str(formData, "cliente_nome");
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
  const tipoEquipamento = str(formData, "equipamento_tipo");
  if (tipoEquipamento) {
    const { data: equipamento, error: equipamentoError } = await supabase
      .from("equipamentos")
      .insert({
        cliente_id: clienteId,
        tipo: tipoEquipamento,
        marca: str(formData, "equipamento_marca"),
        modelo: str(formData, "equipamento_modelo"),
        numero_serie: str(formData, "equipamento_serie"),
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
      problema_relatado: str(formData, "problema_relatado"),
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

export async function setOrdemServicoParada(id: string, parada: boolean, motivo?: string) {
  const { error } = await supabase
    .from("ordens_servico")
    .update({ parada, parada_motivo: parada ? motivo ?? null : null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/ordens-servico/${id}`);
  revalidatePath("/dashboard");
}

export async function setOrdemServicoPagamento(id: string, formaPagamento: FormaPagamento) {
  const { error } = await supabase
    .from("ordens_servico")
    .update({ forma_pagamento: formaPagamento })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/ordens-servico/${id}`);
}

export async function addOsItem(osId: string, formData: FormData) {
  const descricao = str(formData, "descricao");
  if (!descricao) throw new Error("Descrição é obrigatória");
  const pecaId = str(formData, "peca_id");

  const { error } = await supabase.from("os_itens").insert({
    os_id: osId,
    peca_id: pecaId,
    descricao,
    origem: (str(formData, "origem") as ItemOrigem) ?? "estoque",
    quantidade: Number(str(formData, "quantidade") ?? "1"),
    valor_unitario: num(formData, "valor_unitario"),
  });
  if (error) throw new Error(error.message);

  if (pecaId) {
    const quantidade = Number(str(formData, "quantidade") ?? "1");
    const origem = str(formData, "origem");
    if (origem === "estoque") {
      const { data: peca } = await supabase.from("pecas").select("quantidade").eq("id", pecaId).single();
      if (peca) {
        await supabase
          .from("pecas")
          .update({ quantidade: Math.max(0, peca.quantidade - quantidade) })
          .eq("id", pecaId);
      }
    }
  }

  revalidatePath(`/ordens-servico/${osId}`);
  revalidatePath("/estoque");
}

export async function removeOsItem(itemId: string, osId: string) {
  const { error } = await supabase.from("os_itens").delete().eq("id", itemId);
  if (error) throw new Error(error.message);
  revalidatePath(`/ordens-servico/${osId}`);
}

// ---------- Fretes ----------
export async function createPrestadorFrete(formData: FormData) {
  const nome = str(formData, "nome");
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

export async function upsertFrete(osId: string, formData: FormData) {
  const prestadorId = str(formData, "prestador_id");
  const { error } = await supabase.from("fretes").upsert(
    {
      os_id: osId,
      prestador_id: prestadorId,
      valor_custo: num(formData, "valor_custo"),
    },
    { onConflict: "os_id" }
  );
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

// ---------- Estoque ----------
export async function createPeca(formData: FormData) {
  const nome = str(formData, "nome");
  if (!nome) throw new Error("Nome é obrigatório");
  const { error } = await supabase.from("pecas").insert({
    nome,
    codigo: str(formData, "codigo"),
    categoria: str(formData, "categoria"),
    quantidade: Number(str(formData, "quantidade") ?? "0"),
    quantidade_minima: Number(str(formData, "quantidade_minima") ?? "2"),
    preco_unitario: num(formData, "preco_unitario"),
    fornecedor_id: str(formData, "fornecedor_id"),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/estoque");
}

export async function updatePeca(id: string, formData: FormData) {
  const nome = str(formData, "nome");
  if (!nome) throw new Error("Nome é obrigatório");
  const { error } = await supabase
    .from("pecas")
    .update({
      nome,
      codigo: str(formData, "codigo"),
      categoria: str(formData, "categoria"),
      quantidade: Number(str(formData, "quantidade") ?? "0"),
      quantidade_minima: Number(str(formData, "quantidade_minima") ?? "2"),
      preco_unitario: num(formData, "preco_unitario"),
      fornecedor_id: str(formData, "fornecedor_id"),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/estoque");
}

export async function createLojaParceira(formData: FormData) {
  const nome = str(formData, "nome");
  if (!nome) throw new Error("Nome é obrigatório");
  const { error } = await supabase.from("lojas_parceiras").insert({
    nome,
    especialidade: str(formData, "especialidade"),
    telefone: str(formData, "telefone"),
    tempo_entrega: str(formData, "tempo_entrega"),
    desconto_percentual: num(formData, "desconto_percentual"),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/estoque");
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
      cliente_nome_avulso: input.clienteNomeAvulso,
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
export async function createContaPagar(formData: FormData) {
  const descricao = str(formData, "descricao");
  const vencimento = str(formData, "vencimento");
  if (!descricao || !vencimento) throw new Error("Descrição e vencimento são obrigatórios");
  const { error } = await supabase.from("financeiro_contas").insert({
    descricao,
    categoria: str(formData, "categoria"),
    fornecedor: str(formData, "fornecedor"),
    numero_documento: str(formData, "numero_documento"),
    valor: num(formData, "valor"),
    vencimento,
  });
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

export async function createDespesa(formData: FormData) {
  const descricao = str(formData, "descricao");
  if (!descricao) throw new Error("Descrição é obrigatória");
  const { error } = await supabase.from("financeiro_despesas").insert({
    descricao,
    categoria: str(formData, "categoria"),
    valor: num(formData, "valor"),
    data: str(formData, "data") ?? new Date().toISOString().slice(0, 10),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/financeiro");
}

// ---------- Agenda ----------
export async function createAgendaEvento(formData: FormData) {
  const titulo = str(formData, "titulo");
  const data = str(formData, "data");
  const hora = str(formData, "hora") ?? "09:00";
  if (!titulo || !data) throw new Error("Título e data são obrigatórios");
  const { error } = await supabase.from("agenda_eventos").insert({
    titulo,
    tipo: (str(formData, "tipo") as AgendaTipo) ?? "oficina",
    cliente_id: str(formData, "cliente_id"),
    endereco: str(formData, "endereco"),
    data_hora_inicio: new Date(`${data}T${hora}`).toISOString(),
    tecnico: str(formData, "tecnico"),
    observacoes: str(formData, "observacoes"),
  });
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
  const titulo = str(formData, "titulo");
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

export async function updateConfiguracoesGarantia(formData: FormData) {
  const { error } = await supabase
    .from("configuracoes")
    .update({
      garantia_prazo_dias: Number(str(formData, "garantia_prazo_dias") ?? "90"),
      garantia_tipo_cobertura: str(formData, "garantia_tipo_cobertura") ?? "Garantia Total (Peças e Mão de Obra)",
      garantia_texto_padrao: str(formData, "garantia_texto_padrao"),
      garantia_alerta_dias: Number(str(formData, "garantia_alerta_dias") ?? "7"),
      garantia_notificar_tecnicos: formData.get("garantia_notificar_tecnicos") === "on",
      garantia_sms_cliente: formData.get("garantia_sms_cliente") === "on",
      garantia_assinatura_digital: formData.get("garantia_assinatura_digital") === "on",
      garantia_qrcode: formData.get("garantia_qrcode") === "on",
    })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/garantias/configuracoes");
}

export async function updateConfiguracoesEtiqueta(formData: FormData) {
  const { error } = await supabase
    .from("configuracoes")
    .update({
      etiqueta_subtitulo: str(formData, "etiqueta_subtitulo") ?? "Assistência técnica especializada",
    })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/configuracoes");
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
    const nome = str(formData, "cliente_nome");
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
      descricao: str(formData, "descricao"),
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
      descricao: str(formData, "descricao"),
      observacoes: str(formData, "observacoes"),
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
  const descricao = str(formData, "descricao");
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
