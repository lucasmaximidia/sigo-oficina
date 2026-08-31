import type { Database, FreteTipo } from "./database";

export type Cliente = Database["public"]["Tables"]["clientes"]["Row"];
export type Equipamento = Database["public"]["Tables"]["equipamentos"]["Row"];
export type LojaParceira = Database["public"]["Tables"]["lojas_parceiras"]["Row"];
export type Peca = Database["public"]["Tables"]["pecas"]["Row"];
export type OrdemServico = Database["public"]["Tables"]["ordens_servico"]["Row"];
export type OsItem = Database["public"]["Tables"]["os_itens"]["Row"];
export type OsMaoObraItem = Database["public"]["Tables"]["os_mao_obra_itens"]["Row"];
export type OsPagamento = Database["public"]["Tables"]["os_pagamentos"]["Row"];
export type VendaPdv = Database["public"]["Tables"]["vendas_pdv"]["Row"];
export type VendaItem = Database["public"]["Tables"]["venda_itens"]["Row"];
export type VendaPagamento = Database["public"]["Tables"]["venda_pagamentos"]["Row"];
export type FinanceiroConta = Database["public"]["Tables"]["financeiro_contas"]["Row"];
export type FinanceiroDespesa = Database["public"]["Tables"]["financeiro_despesas"]["Row"];
export type FinanceiroRetirada = Database["public"]["Tables"]["financeiro_retiradas"]["Row"];
export type AgendaEvento = Database["public"]["Tables"]["agenda_eventos"]["Row"];
export type Tarefa = Database["public"]["Tables"]["tarefas"]["Row"];
export type Configuracao = Database["public"]["Tables"]["configuracoes"]["Row"];
export type VwGarantia = Database["public"]["Views"]["vw_garantias"]["Row"];
export type Orcamento = Database["public"]["Tables"]["orcamentos"]["Row"];
export type OrcamentoItem = Database["public"]["Tables"]["orcamento_itens"]["Row"];
export type PrestadorFrete = Database["public"]["Tables"]["prestadores_frete"]["Row"];
export type Frete = Database["public"]["Tables"]["fretes"]["Row"];
export type EntradaEstoque = Database["public"]["Tables"]["entradas_estoque"]["Row"];
export type EntradaEstoqueItem = Database["public"]["Tables"]["entrada_estoque_itens"]["Row"];
export type EmpresaAutorizada = Database["public"]["Tables"]["empresas_autorizadas"]["Row"];
export type BalancoEstoque = Database["public"]["Tables"]["balancos_estoque"]["Row"];
export type BalancoEstoqueItem = Database["public"]["Tables"]["balanco_estoque_itens"]["Row"];

export type OrdemServicoComRelacoes = OrdemServico & {
  clientes: Pick<Cliente, "id" | "nome" | "telefone" | "email"> | null;
  equipamentos: Pick<Equipamento, "id" | "tipo" | "marca" | "modelo" | "numero_serie"> | null;
  os_itens?: OsItem[];
};

export interface ItemParceiroPendente {
  id: string;
  descricao: string;
  valor: number;
  osNumero: number | null;
  clientePagou: boolean;
}

export interface ParceiroPendente {
  lojaId: string;
  lojaNome: string;
  totalFechavel: number;
  totalGeral: number;
  itens: ItemParceiroPendente[];
}

export interface ItemAutorizadaPendente {
  osId: string;
  osNumero: number;
  valor: number;
  dataFinalizacao: string | null;
}

export interface AutorizadaPendente {
  empresaId: string;
  empresaNome: string;
  total: number;
  itens: ItemAutorizadaPendente[];
}

export interface Entrada {
  id: string;
  tipo: "os" | "pdv";
  origemLabel: string;
  cliente: string;
  data: string;
  formaPagamento: string;
  formaPagamentoChave: string;
  valor: number;
}

export interface BalancoEstoqueComItens extends BalancoEstoque {
  itens: BalancoEstoqueItem[];
}

export interface FreteComRelacoes {
  id: string;
  os_id: string;
  valor_custo: number;
  status: "pendente" | "pago";
  tipo: FreteTipo;
  data_pagamento: string | null;
  created_at: string;
  ordens_servico: { numero: number; valor_frete: number } | null;
  prestadores_frete: { nome: string } | null;
}

export * from "./database";
