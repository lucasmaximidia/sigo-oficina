export interface RelatorioColuna {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  tipo: "texto" | "moeda" | "data";
  flex: number;
}

export const RELATORIO_COLUNAS: RelatorioColuna[] = [
  { key: "cliente", label: "Cliente", tipo: "texto", flex: 2 },
  { key: "data_entrada", label: "Entrada", tipo: "data", flex: 1 },
  { key: "mao_obra", label: "Mão de Obra", tipo: "moeda", align: "right", flex: 1 },
  { key: "frete_pago", label: "Frete Pago (Freteiro)", tipo: "moeda", align: "right", flex: 1 },
  { key: "frete_cobrado", label: "Frete Cobrado (Cliente)", tipo: "moeda", align: "right", flex: 1 },
  { key: "pecas_oficina_desc", label: "Peças Utilizadas - Oficina", tipo: "texto", flex: 2 },
  { key: "valor_com_desconto", label: "Valor c/ Desconto", tipo: "moeda", align: "right", flex: 1.1 },
  { key: "forma_pagamento", label: "Forma Pagamento", tipo: "texto", flex: 1 },
  { key: "produto", label: "Produto", tipo: "texto", flex: 1.6 },
  { key: "valor_pecas_loja", label: "Peças Loja", tipo: "moeda", align: "right", flex: 1 },
  { key: "valor_pecas_oficina", label: "Peças Oficina", tipo: "moeda", align: "right", flex: 1 },
  { key: "pecas_loja_desc", label: "Peças Utilizadas - Loja", tipo: "texto", flex: 2 },
  { key: "valor_total", label: "Valor Total", tipo: "moeda", align: "right", flex: 1 },
  { key: "data_pagamento", label: "Pagam. (Data)", tipo: "data", flex: 1 },
] as const;

// Opção extra ao lado das colunas: não é um dado da OS, mas controla se o
// bloco de resumo (total recebido / faturamento) aparece no fim do PDF.
export const RELATORIO_OPCAO_RESUMO = { key: "resumo_total", label: "Resumo Total (Recebido / Faturamento)" } as const;

// Colunas marcadas por padrão ao escolher uma loja parceira específica no
// filtro do relatório (fechamento mensal recorrente com esse parceiro).
export const RELATORIO_COLUNAS_PADRAO_POR_LOJA: Record<string, string[]> = {
  "CASA DOS REPAROS": ["cliente", "data_entrada", "forma_pagamento", "produto", "valor_pecas_loja", "pecas_loja_desc"],
};

export const formaPagamentoLabel: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  cartao: "Cartão",
  autorizada: "Autorizada",
};
