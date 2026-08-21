import type { Database } from "./database";

export type Cliente = Database["public"]["Tables"]["clientes"]["Row"];
export type Equipamento = Database["public"]["Tables"]["equipamentos"]["Row"];
export type LojaParceira = Database["public"]["Tables"]["lojas_parceiras"]["Row"];
export type Peca = Database["public"]["Tables"]["pecas"]["Row"];
export type OrdemServico = Database["public"]["Tables"]["ordens_servico"]["Row"];
export type OsItem = Database["public"]["Tables"]["os_itens"]["Row"];
export type VendaPdv = Database["public"]["Tables"]["vendas_pdv"]["Row"];
export type VendaItem = Database["public"]["Tables"]["venda_itens"]["Row"];
export type VendaPagamento = Database["public"]["Tables"]["venda_pagamentos"]["Row"];
export type FinanceiroConta = Database["public"]["Tables"]["financeiro_contas"]["Row"];
export type FinanceiroDespesa = Database["public"]["Tables"]["financeiro_despesas"]["Row"];
export type AgendaEvento = Database["public"]["Tables"]["agenda_eventos"]["Row"];
export type Tarefa = Database["public"]["Tables"]["tarefas"]["Row"];
export type Configuracao = Database["public"]["Tables"]["configuracoes"]["Row"];
export type VwGarantia = Database["public"]["Views"]["vw_garantias"]["Row"];
export type Orcamento = Database["public"]["Tables"]["orcamentos"]["Row"];
export type OrcamentoItem = Database["public"]["Tables"]["orcamento_itens"]["Row"];

export type OrdemServicoComRelacoes = OrdemServico & {
  clientes: Pick<Cliente, "id" | "nome" | "telefone" | "email"> | null;
  equipamentos: Pick<Equipamento, "id" | "tipo" | "marca" | "modelo" | "numero_serie"> | null;
  os_itens?: OsItem[];
};

export * from "./database";
