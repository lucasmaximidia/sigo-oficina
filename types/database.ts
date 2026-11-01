export type OsStatus =
  | "aguardando_orcamento"
  | "em_execucao"
  | "aguardando_pecas"
  | "aguardando_pagamento"
  | "finalizado"
  | "cancelado";

export type OsUrgencia = "baixa" | "media" | "alta";
export type OsOrigem = "balcao" | "domicilio" | "frete";
export type FormaPagamento = "dinheiro" | "pix" | "cartao" | "autorizada";
export type TipoCartao = "debito" | "credito";
export type ItemOrigem = "estoque" | "loja_parceira" | "compra_emergencial";
export type VendaItemTipo = "peca" | "servico";
export type ContaStatus = "pendente" | "pago" | "atrasado";
export type AgendaTipo = "servico_domicilio" | "frete" | "visita" | "oficina";
export type AgendaStatus =
  | "agendado"
  | "confirmado"
  | "aguardando_cliente"
  | "concluido"
  | "cancelado";
export type GarantiaStatus = "ativa" | "critica" | "expirada" | "sem_garantia";
export type OrcamentoStatus = "rascunho" | "enviado" | "aprovado" | "recusado" | "expirado";
export type OrcamentoItemTipo = "peca" | "mao_obra";
export type FreteStatus = "pendente" | "pago";
export type FreteTipo = "buscar" | "entrega";
export type RetiradaTipo = "mao_de_obra" | "pagamento_parceiro" | "fatura_cartao" | "outro";
export type NotaFiscalOrigem = "os" | "venda_pdv" | "avulsa";
export type NotaFiscalMotivo = "obrigatoria_cartao_pix" | "opcional_cliente_sim" | "opcional_cliente_nao";

export type LocacaoVeiculoTipo = "scooter" | "bicicleta" | "quadriciclo";
export type LocacaoVeiculoStatus = "disponivel" | "alugado" | "manutencao" | "inativo";
export type LocacaoTipoContrato = "padrao" | "infantil";
export type LocacaoFormaPagamento = "pix" | "cartao" | "dinheiro" | "transferencia";
export type LocacaoStatusPagamento = "pago" | "pendente" | "parcial";
export type NotaFiscalStatus = "pendente" | "emitida" | "erro" | "cancelada" | "nao_emitir";

export type EtiquetaTipo = "peca" | "os" | "autorizada";
export type EtiquetaAlinhamento = "left" | "center" | "right";
export type EtiquetaTamanhoFonte = "pequena" | "media" | "grande";

export type PessoalRendaCategoria = "salario_lucas" | "salario_jessica" | "terceiros" | "outro";
export type PessoalItemSecao = "fixa" | "carro" | "dizimo" | "extra";
export type PessoalCartaoCategoria =
  | "alimentacao"
  | "carro"
  | "casa"
  | "celular"
  | "farmacia"
  | "feira"
  | "lanches"
  | "loja"
  | "oficina"
  | "igreja"
  | "outra_pessoa"
  | "outros"
  | "voltcity";

export interface EtiquetaCampoConfig {
  id: string;
  visivel: boolean;
  alinhamento: EtiquetaAlinhamento;
  tamanhoFonte: EtiquetaTamanhoFonte;
  // Quando true, esse campo compartilha a linha com o próximo campo visível
  // (lado a lado, em vez de um abaixo do outro) — ex.: Data e Nº da O.S.
  compartilharLinha: boolean;
  // Quando true, desenha uma linha fina depois deste campo (ou da linha
  // toda, se compartilhada com o próximo), separando-o do campo seguinte.
  mostrarDivisorDepois: boolean;
  // Espaço em pixels entre este campo (ou linha, se compartilhada) e o
  // próximo campo visível — ignorado quando este é o último campo visível.
  espacamentoDepoisPx: number;
}

export interface EtiquetaTipoConfig {
  alturaMm: number;
  mostrarLogo: boolean;
  // Altura da logo em pixels, controlada diretamente pelo usuário (a
  // largura acompanha a largura total da etiqueta, então uma logo mais
  // larga que alta se ajusta sozinha via object-fit: contain).
  logoAlturaPx: number;
  // Linha fina opcional separando o cabeçalho (logo/nome da empresa) do
  // corpo da etiqueta.
  mostrarDivisorCabecalho: boolean;
  campos: EtiquetaCampoConfig[];
}

// Observação: os campos Row/Insert/Update abaixo são escritos como literais de
// objeto inline (não interfaces nomeadas) de propósito — é o mesmo formato que
// `supabase gen types typescript` produz, e é o formato que o supabase-js
// consegue checar estruturalmente contra `Record<string, unknown>` nos
// generics do PostgREST. Interfaces nomeadas referenciadas aqui quebram essa
// checagem e fazem todo o client cair para `never`.
export interface Database {
  public: {
    Tables: {
      clientes: {
        Row: {
          id: string;
          nome: string;
          telefone: string | null;
          email: string | null;
          cpf_cnpj: string | null;
          endereco: string | null;
          bairro: string | null;
          cidade: string | null;
          estado: string | null;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          telefone?: string | null;
          email?: string | null;
          cpf_cnpj?: string | null;
          endereco?: string | null;
          bairro?: string | null;
          cidade?: string | null;
          estado?: string | null;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          telefone?: string | null;
          email?: string | null;
          cpf_cnpj?: string | null;
          endereco?: string | null;
          bairro?: string | null;
          cidade?: string | null;
          estado?: string | null;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      equipamentos: {
        Row: {
          id: string;
          cliente_id: string;
          tipo: string;
          marca: string | null;
          modelo: string | null;
          numero_serie: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          cliente_id: string;
          tipo: string;
          marca?: string | null;
          modelo?: string | null;
          numero_serie?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          cliente_id?: string;
          tipo?: string;
          marca?: string | null;
          modelo?: string | null;
          numero_serie?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      lojas_parceiras: {
        Row: {
          id: string;
          nome: string;
          especialidade: string | null;
          telefone: string | null;
          tempo_entrega: string | null;
          desconto_percentual: number | null;
          principal: boolean;
          cnpj: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          especialidade?: string | null;
          telefone?: string | null;
          tempo_entrega?: string | null;
          desconto_percentual?: number | null;
          principal?: boolean;
          cnpj?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          especialidade?: string | null;
          telefone?: string | null;
          tempo_entrega?: string | null;
          desconto_percentual?: number | null;
          principal?: boolean;
          cnpj?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      pecas: {
        Row: {
          id: string;
          nome: string;
          codigo: string | null;
          categoria: string | null;
          quantidade: number;
          quantidade_minima: number;
          preco_custo: number;
          preco_venda: number;
          fornecedor_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          codigo?: string | null;
          categoria?: string | null;
          quantidade?: number;
          quantidade_minima?: number;
          preco_custo?: number;
          preco_venda?: number;
          fornecedor_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          codigo?: string | null;
          categoria?: string | null;
          quantidade?: number;
          quantidade_minima?: number;
          preco_custo?: number;
          preco_venda?: number;
          fornecedor_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      balancos_estoque: {
        Row: {
          id: string;
          data: string;
          observacao: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          data?: string;
          observacao?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          data?: string;
          observacao?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      balanco_estoque_itens: {
        Row: {
          id: string;
          balanco_id: string;
          peca_id: string | null;
          peca_nome: string;
          peca_codigo: string | null;
          quantidade_sistema: number;
          quantidade_contada: number;
          diferenca: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          balanco_id: string;
          peca_id?: string | null;
          peca_nome: string;
          peca_codigo?: string | null;
          quantidade_sistema: number;
          quantidade_contada: number;
          diferenca: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          balanco_id?: string;
          peca_id?: string | null;
          peca_nome?: string;
          peca_codigo?: string | null;
          quantidade_sistema?: number;
          quantidade_contada?: number;
          diferenca?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      ordens_servico: {
        Row: {
          id: string;
          numero: number;
          cliente_id: string;
          equipamento_id: string | null;
          problema_relatado: string | null;
          diagnostico: string | null;
          status: OsStatus;
          urgencia: OsUrgencia;
          origem: OsOrigem;
          valor_mao_obra: number;
          valor_frete: number;
          desconto: number;
          forma_pagamento: FormaPagamento | null;
          data_entrada: string;
          data_finalizacao: string | null;
          data_pagamento: string | null;
          data_retirada: string | null;
          tipo_cartao: TipoCartao | null;
          valor_pago_bruto: number | null;
          valor_recebido_liquido: number | null;
          garantia_dias: number;
          parada: boolean;
          parada_motivo: string | null;
          empresa_autorizada_id: string | null;
          numero_os_autorizada: string | null;
          referencia_autorizada: string | null;
          produto_autorizada: string | null;
          numero_serie_autorizada: string | null;
          observacoes_internas: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          numero?: number;
          cliente_id: string;
          equipamento_id?: string | null;
          problema_relatado?: string | null;
          diagnostico?: string | null;
          status?: OsStatus;
          urgencia?: OsUrgencia;
          origem?: OsOrigem;
          valor_mao_obra?: number;
          valor_frete?: number;
          desconto?: number;
          forma_pagamento?: FormaPagamento | null;
          data_entrada?: string;
          data_finalizacao?: string | null;
          data_pagamento?: string | null;
          data_retirada?: string | null;
          tipo_cartao?: TipoCartao | null;
          valor_pago_bruto?: number | null;
          valor_recebido_liquido?: number | null;
          garantia_dias?: number;
          parada?: boolean;
          parada_motivo?: string | null;
          empresa_autorizada_id?: string | null;
          numero_os_autorizada?: string | null;
          referencia_autorizada?: string | null;
          produto_autorizada?: string | null;
          numero_serie_autorizada?: string | null;
          observacoes_internas?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          numero?: number;
          cliente_id?: string;
          equipamento_id?: string | null;
          problema_relatado?: string | null;
          diagnostico?: string | null;
          status?: OsStatus;
          urgencia?: OsUrgencia;
          origem?: OsOrigem;
          valor_mao_obra?: number;
          valor_frete?: number;
          desconto?: number;
          forma_pagamento?: FormaPagamento | null;
          data_entrada?: string;
          data_finalizacao?: string | null;
          data_pagamento?: string | null;
          data_retirada?: string | null;
          tipo_cartao?: TipoCartao | null;
          valor_pago_bruto?: number | null;
          valor_recebido_liquido?: number | null;
          garantia_dias?: number;
          parada?: boolean;
          parada_motivo?: string | null;
          empresa_autorizada_id?: string | null;
          numero_os_autorizada?: string | null;
          referencia_autorizada?: string | null;
          produto_autorizada?: string | null;
          numero_serie_autorizada?: string | null;
          observacoes_internas?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      empresas_autorizadas: {
        Row: {
          id: string;
          nome: string;
          telefone: string | null;
          ativo: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          telefone?: string | null;
          ativo?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          telefone?: string | null;
          ativo?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      os_itens: {
        Row: {
          id: string;
          os_id: string;
          peca_id: string | null;
          loja_parceira_id: string | null;
          descricao: string;
          origem: ItemOrigem;
          quantidade: number;
          valor_unitario: number;
          custo_unitario: number | null;
          pago_em: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          os_id: string;
          peca_id?: string | null;
          loja_parceira_id?: string | null;
          descricao: string;
          origem?: ItemOrigem;
          quantidade?: number;
          valor_unitario?: number;
          custo_unitario?: number | null;
          pago_em?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          os_id?: string;
          peca_id?: string | null;
          loja_parceira_id?: string | null;
          descricao?: string;
          origem?: ItemOrigem;
          quantidade?: number;
          valor_unitario?: number;
          custo_unitario?: number | null;
          pago_em?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      os_mao_obra_itens: {
        Row: {
          id: string;
          os_id: string;
          descricao: string;
          valor: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          os_id: string;
          descricao: string;
          valor?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          os_id?: string;
          descricao?: string;
          valor?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      os_pagamentos: {
        Row: {
          id: string;
          os_id: string;
          forma_pagamento: FormaPagamento;
          tipo_cartao: TipoCartao | null;
          valor: number;
          valor_recebido_liquido: number | null;
          data: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          os_id: string;
          forma_pagamento: FormaPagamento;
          tipo_cartao?: TipoCartao | null;
          valor?: number;
          valor_recebido_liquido?: number | null;
          data?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          os_id?: string;
          forma_pagamento?: FormaPagamento;
          tipo_cartao?: TipoCartao | null;
          valor?: number;
          valor_recebido_liquido?: number | null;
          data?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      vendas_pdv: {
        Row: {
          id: string;
          numero: number;
          cliente_id: string | null;
          cliente_nome_avulso: string | null;
          forma_pagamento: FormaPagamento;
          subtotal: number;
          desconto: number;
          total: number;
          created_at: string;
          deletado_em: string | null;
        };
        Insert: {
          id?: string;
          numero?: number;
          cliente_id?: string | null;
          cliente_nome_avulso?: string | null;
          forma_pagamento?: FormaPagamento;
          subtotal?: number;
          desconto?: number;
          total?: number;
          created_at?: string;
          deletado_em?: string | null;
        };
        Update: {
          id?: string;
          numero?: number;
          cliente_id?: string | null;
          cliente_nome_avulso?: string | null;
          forma_pagamento?: FormaPagamento;
          subtotal?: number;
          desconto?: number;
          total?: number;
          created_at?: string;
          deletado_em?: string | null;
        };
        Relationships: [];
      };
      venda_itens: {
        Row: {
          id: string;
          venda_id: string;
          peca_id: string | null;
          descricao: string;
          tipo: VendaItemTipo;
          quantidade: number;
          valor_unitario: number;
        };
        Insert: {
          id?: string;
          venda_id: string;
          peca_id?: string | null;
          descricao: string;
          tipo?: VendaItemTipo;
          quantidade?: number;
          valor_unitario?: number;
        };
        Update: {
          id?: string;
          venda_id?: string;
          peca_id?: string | null;
          descricao?: string;
          tipo?: VendaItemTipo;
          quantidade?: number;
          valor_unitario?: number;
        };
        Relationships: [];
      };
      venda_pagamentos: {
        Row: {
          id: string;
          venda_id: string;
          forma_pagamento: FormaPagamento;
          tipo_cartao: TipoCartao | null;
          valor: number;
          valor_recebido_liquido: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          venda_id: string;
          forma_pagamento: FormaPagamento;
          tipo_cartao?: TipoCartao | null;
          valor?: number;
          valor_recebido_liquido?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          venda_id?: string;
          forma_pagamento?: FormaPagamento;
          tipo_cartao?: TipoCartao | null;
          valor?: number;
          valor_recebido_liquido?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      notas_fiscais: {
        Row: {
          id: string;
          origem: NotaFiscalOrigem;
          os_id: string | null;
          venda_id: string | null;
          cliente_id: string | null;
          cliente_nome: string;
          cliente_documento: string | null;
          descricao_servico: string;
          valor: number;
          motivo: NotaFiscalMotivo;
          status: NotaFiscalStatus;
          provider: string;
          provider_id: string | null;
          numero_nfse: string | null;
          codigo_verificacao: string | null;
          url_pdf: string | null;
          url_xml: string | null;
          erro_mensagem: string | null;
          created_at: string;
          emitida_em: string | null;
        };
        Insert: {
          id?: string;
          origem: NotaFiscalOrigem;
          os_id?: string | null;
          venda_id?: string | null;
          cliente_id?: string | null;
          cliente_nome: string;
          cliente_documento?: string | null;
          descricao_servico: string;
          valor: number;
          motivo: NotaFiscalMotivo;
          status?: NotaFiscalStatus;
          provider?: string;
          provider_id?: string | null;
          numero_nfse?: string | null;
          codigo_verificacao?: string | null;
          url_pdf?: string | null;
          url_xml?: string | null;
          erro_mensagem?: string | null;
          created_at?: string;
          emitida_em?: string | null;
        };
        Update: {
          id?: string;
          origem?: NotaFiscalOrigem;
          os_id?: string | null;
          venda_id?: string | null;
          cliente_id?: string | null;
          cliente_nome?: string;
          cliente_documento?: string | null;
          descricao_servico?: string;
          valor?: number;
          motivo?: NotaFiscalMotivo;
          status?: NotaFiscalStatus;
          provider?: string;
          provider_id?: string | null;
          numero_nfse?: string | null;
          codigo_verificacao?: string | null;
          url_pdf?: string | null;
          url_xml?: string | null;
          erro_mensagem?: string | null;
          created_at?: string;
          emitida_em?: string | null;
        };
        Relationships: [];
      };
      financeiro_contas: {
        Row: {
          id: string;
          descricao: string;
          categoria: string | null;
          fornecedor: string | null;
          numero_documento: string | null;
          valor: number;
          vencimento: string;
          status: ContaStatus;
          pago_em: string | null;
          parcela_atual: number | null;
          parcela_total: number | null;
          entrada_estoque_id: string | null;
          created_at: string;
          deletado_em: string | null;
        };
        Insert: {
          id?: string;
          descricao: string;
          categoria?: string | null;
          fornecedor?: string | null;
          numero_documento?: string | null;
          valor?: number;
          vencimento: string;
          status?: ContaStatus;
          pago_em?: string | null;
          parcela_atual?: number | null;
          parcela_total?: number | null;
          entrada_estoque_id?: string | null;
          created_at?: string;
          deletado_em?: string | null;
        };
        Update: {
          id?: string;
          descricao?: string;
          categoria?: string | null;
          fornecedor?: string | null;
          numero_documento?: string | null;
          valor?: number;
          vencimento?: string;
          status?: ContaStatus;
          pago_em?: string | null;
          parcela_atual?: number | null;
          parcela_total?: number | null;
          entrada_estoque_id?: string | null;
          created_at?: string;
          deletado_em?: string | null;
        };
        Relationships: [];
      };
      entradas_estoque: {
        Row: {
          id: string;
          loja_id: string | null;
          numero_nf: string | null;
          data_nf: string;
          data_chegada: string | null;
          valor_total: number;
          observacoes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          loja_id?: string | null;
          numero_nf?: string | null;
          data_nf: string;
          data_chegada?: string | null;
          valor_total?: number;
          observacoes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          loja_id?: string | null;
          numero_nf?: string | null;
          data_nf?: string;
          data_chegada?: string | null;
          valor_total?: number;
          observacoes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      entrada_estoque_itens: {
        Row: {
          id: string;
          entrada_id: string;
          peca_id: string | null;
          quantidade: number;
          valor_unitario: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          entrada_id: string;
          peca_id?: string | null;
          quantidade?: number;
          valor_unitario?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          entrada_id?: string;
          peca_id?: string | null;
          quantidade?: number;
          valor_unitario?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      financeiro_despesas: {
        Row: {
          id: string;
          descricao: string;
          categoria: string | null;
          valor: number;
          data: string;
          os_item_id: string | null;
          cartao: boolean;
          pago_em: string | null;
          created_at: string;
          deletado_em: string | null;
        };
        Insert: {
          id?: string;
          descricao: string;
          categoria?: string | null;
          valor?: number;
          data?: string;
          os_item_id?: string | null;
          cartao?: boolean;
          pago_em?: string | null;
          created_at?: string;
          deletado_em?: string | null;
        };
        Update: {
          id?: string;
          descricao?: string;
          categoria?: string | null;
          valor?: number;
          data?: string;
          os_item_id?: string | null;
          cartao?: boolean;
          pago_em?: string | null;
          created_at?: string;
          deletado_em?: string | null;
        };
        Relationships: [];
      };
      financeiro_ajustes_caixa: {
        Row: {
          id: string;
          descricao: string;
          valor: number;
          data: string;
          created_at: string;
          deletado_em: string | null;
        };
        Insert: {
          id?: string;
          descricao: string;
          valor?: number;
          data?: string;
          created_at?: string;
          deletado_em?: string | null;
        };
        Update: {
          id?: string;
          descricao?: string;
          valor?: number;
          data?: string;
          created_at?: string;
          deletado_em?: string | null;
        };
        Relationships: [];
      };
      financeiro_retiradas: {
        Row: {
          id: string;
          tipo: RetiradaTipo;
          descricao: string;
          loja_parceira_id: string | null;
          valor: number;
          data: string;
          created_at: string;
          deletado_em: string | null;
        };
        Insert: {
          id?: string;
          tipo?: RetiradaTipo;
          descricao: string;
          loja_parceira_id?: string | null;
          valor?: number;
          data?: string;
          created_at?: string;
          deletado_em?: string | null;
        };
        Update: {
          id?: string;
          tipo?: RetiradaTipo;
          descricao?: string;
          loja_parceira_id?: string | null;
          valor?: number;
          data?: string;
          created_at?: string;
          deletado_em?: string | null;
        };
        Relationships: [];
      };
      agenda_eventos: {
        Row: {
          id: string;
          titulo: string;
          tipo: AgendaTipo;
          cliente_id: string | null;
          os_id: string | null;
          endereco: string | null;
          data_hora_inicio: string;
          data_hora_fim: string | null;
          status: AgendaStatus;
          tecnico: string | null;
          observacoes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          tipo?: AgendaTipo;
          cliente_id?: string | null;
          os_id?: string | null;
          endereco?: string | null;
          data_hora_inicio: string;
          data_hora_fim?: string | null;
          status?: AgendaStatus;
          tecnico?: string | null;
          observacoes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          titulo?: string;
          tipo?: AgendaTipo;
          cliente_id?: string | null;
          os_id?: string | null;
          endereco?: string | null;
          data_hora_inicio?: string;
          data_hora_fim?: string | null;
          status?: AgendaStatus;
          tecnico?: string | null;
          observacoes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      tarefas: {
        Row: {
          id: string;
          titulo: string;
          descricao: string | null;
          concluida: boolean;
          data: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          descricao?: string | null;
          concluida?: boolean;
          data?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          titulo?: string;
          descricao?: string | null;
          concluida?: boolean;
          data?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      configuracoes: {
        Row: {
          id: number;
          nome_empresa: string;
          cnpj: string | null;
          telefone: string | null;
          endereco: string | null;
          logo_url: string | null;
          garantia_prazo_dias: number;
          garantia_tipo_cobertura: string;
          garantia_texto_padrao: string | null;
          garantia_alerta_dias: number;
          garantia_logo_certificado_url: string | null;
          garantia_assinatura_digital: boolean;
          garantia_qrcode: boolean;
          etiqueta_logo_url: string | null;
          etiqueta_peca_config: EtiquetaTipoConfig;
          etiqueta_os_config: EtiquetaTipoConfig;
          etiqueta_autorizada_config: EtiquetaTipoConfig;
          dashboard_mostrar_stats: boolean;
          dashboard_mostrar_agenda: boolean;
          dashboard_mostrar_os_paradas: boolean;
          dashboard_mostrar_tarefas: boolean;
          dashboard_os_parada_dias: number;
          dashboard_mostrar_pdv_hoje: boolean;
          dashboard_mostrar_fretes_pendentes: boolean;
          dashboard_mostrar_garantias_vencendo: boolean;
          dashboard_mostrar_orcamentos_pendentes: boolean;
          dashboard_mostrar_boletos_pendentes: boolean;
          dashboard_boletos_dias: number;
          nfse_ativo: boolean;
          nfse_codigo_servico: string | null;
          nfse_descricao_padrao: string;
          nfse_aliquota_iss: number | null;
          nfse_obrigatoria_cartao_pix: boolean;
          push_contas_vencer_ativo: boolean;
          push_contas_vencer_dias: number;
          push_contas_vencer_horario: string;
          push_contas_vencer_ultimo_envio: string | null;
          push_contas_vencer_ultimo_resultado: string | null;
          push_agenda_hoje_ativo: boolean;
          push_agenda_hoje_horario: string;
          push_agenda_hoje_ultimo_envio: string | null;
          push_agenda_hoje_ultimo_resultado: string | null;
          push_locacao_devolucao_ativo: boolean;
          push_locacao_devolucao_dias: number;
          push_locacao_devolucao_horario: string;
          push_locacao_devolucao_ultimo_envio: string | null;
          push_locacao_devolucao_ultimo_resultado: string | null;
          updated_at: string;
        };
        Insert: {
          id?: number;
          nome_empresa?: string;
          cnpj?: string | null;
          telefone?: string | null;
          endereco?: string | null;
          logo_url?: string | null;
          garantia_prazo_dias?: number;
          garantia_tipo_cobertura?: string;
          garantia_texto_padrao?: string | null;
          garantia_alerta_dias?: number;
          garantia_logo_certificado_url?: string | null;
          garantia_assinatura_digital?: boolean;
          garantia_qrcode?: boolean;
          etiqueta_logo_url?: string | null;
          etiqueta_peca_config?: EtiquetaTipoConfig;
          etiqueta_os_config?: EtiquetaTipoConfig;
          etiqueta_autorizada_config?: EtiquetaTipoConfig;
          dashboard_mostrar_stats?: boolean;
          dashboard_mostrar_agenda?: boolean;
          dashboard_mostrar_os_paradas?: boolean;
          dashboard_mostrar_tarefas?: boolean;
          dashboard_os_parada_dias?: number;
          dashboard_mostrar_pdv_hoje?: boolean;
          dashboard_mostrar_fretes_pendentes?: boolean;
          dashboard_mostrar_garantias_vencendo?: boolean;
          dashboard_mostrar_orcamentos_pendentes?: boolean;
          dashboard_mostrar_boletos_pendentes?: boolean;
          dashboard_boletos_dias?: number;
          nfse_ativo?: boolean;
          nfse_codigo_servico?: string | null;
          nfse_descricao_padrao?: string;
          nfse_aliquota_iss?: number | null;
          nfse_obrigatoria_cartao_pix?: boolean;
          push_contas_vencer_ativo?: boolean;
          push_contas_vencer_dias?: number;
          push_contas_vencer_horario?: string;
          push_contas_vencer_ultimo_envio?: string | null;
          push_contas_vencer_ultimo_resultado?: string | null;
          push_agenda_hoje_ativo?: boolean;
          push_agenda_hoje_horario?: string;
          push_agenda_hoje_ultimo_envio?: string | null;
          push_agenda_hoje_ultimo_resultado?: string | null;
          push_locacao_devolucao_ativo?: boolean;
          push_locacao_devolucao_dias?: number;
          push_locacao_devolucao_horario?: string;
          push_locacao_devolucao_ultimo_envio?: string | null;
          push_locacao_devolucao_ultimo_resultado?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          nome_empresa?: string;
          cnpj?: string | null;
          telefone?: string | null;
          endereco?: string | null;
          logo_url?: string | null;
          garantia_prazo_dias?: number;
          garantia_tipo_cobertura?: string;
          garantia_texto_padrao?: string | null;
          garantia_alerta_dias?: number;
          garantia_logo_certificado_url?: string | null;
          garantia_assinatura_digital?: boolean;
          garantia_qrcode?: boolean;
          etiqueta_logo_url?: string | null;
          etiqueta_peca_config?: EtiquetaTipoConfig;
          etiqueta_os_config?: EtiquetaTipoConfig;
          etiqueta_autorizada_config?: EtiquetaTipoConfig;
          dashboard_mostrar_stats?: boolean;
          dashboard_mostrar_agenda?: boolean;
          dashboard_mostrar_os_paradas?: boolean;
          dashboard_mostrar_tarefas?: boolean;
          dashboard_os_parada_dias?: number;
          dashboard_mostrar_pdv_hoje?: boolean;
          dashboard_mostrar_fretes_pendentes?: boolean;
          dashboard_mostrar_garantias_vencendo?: boolean;
          dashboard_mostrar_orcamentos_pendentes?: boolean;
          dashboard_mostrar_boletos_pendentes?: boolean;
          dashboard_boletos_dias?: number;
          nfse_ativo?: boolean;
          nfse_codigo_servico?: string | null;
          nfse_descricao_padrao?: string;
          nfse_aliquota_iss?: number | null;
          nfse_obrigatoria_cartao_pix?: boolean;
          push_contas_vencer_ativo?: boolean;
          push_contas_vencer_dias?: number;
          push_contas_vencer_horario?: string;
          push_contas_vencer_ultimo_envio?: string | null;
          push_contas_vencer_ultimo_resultado?: string | null;
          push_agenda_hoje_ativo?: boolean;
          push_agenda_hoje_horario?: string;
          push_agenda_hoje_ultimo_envio?: string | null;
          push_agenda_hoje_ultimo_resultado?: string | null;
          push_locacao_devolucao_ativo?: boolean;
          push_locacao_devolucao_dias?: number;
          push_locacao_devolucao_horario?: string;
          push_locacao_devolucao_ultimo_envio?: string | null;
          push_locacao_devolucao_ultimo_resultado?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      orcamentos: {
        Row: {
          id: string;
          numero: number;
          cliente_id: string;
          descricao: string | null;
          observacoes: string | null;
          status: OrcamentoStatus;
          desconto: number;
          data_validade: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          numero?: number;
          cliente_id: string;
          descricao?: string | null;
          observacoes?: string | null;
          status?: OrcamentoStatus;
          desconto?: number;
          data_validade?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          numero?: number;
          cliente_id?: string;
          descricao?: string | null;
          observacoes?: string | null;
          status?: OrcamentoStatus;
          desconto?: number;
          data_validade?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orcamento_itens: {
        Row: {
          id: string;
          orcamento_id: string;
          descricao: string;
          tipo: OrcamentoItemTipo;
          quantidade: number;
          valor_unitario: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          orcamento_id: string;
          descricao: string;
          tipo?: OrcamentoItemTipo;
          quantidade?: number;
          valor_unitario?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          orcamento_id?: string;
          descricao?: string;
          tipo?: OrcamentoItemTipo;
          quantidade?: number;
          valor_unitario?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      prestadores_frete: {
        Row: {
          id: string;
          nome: string;
          telefone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          telefone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          telefone?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      fretes: {
        Row: {
          id: string;
          os_id: string;
          prestador_id: string | null;
          valor_custo: number;
          status: FreteStatus;
          tipo: FreteTipo;
          data_pagamento: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          os_id: string;
          prestador_id?: string | null;
          valor_custo?: number;
          status?: FreteStatus;
          tipo?: FreteTipo;
          data_pagamento?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          os_id?: string;
          prestador_id?: string | null;
          valor_custo?: number;
          status?: FreteStatus;
          tipo?: FreteTipo;
          data_pagamento?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      locacao_icones: {
        Row: {
          id: string;
          nome: string;
          arquivo_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          arquivo_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          arquivo_url?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      locacao_veiculos: {
        Row: {
          id: string;
          tipo: LocacaoVeiculoTipo;
          marca: string;
          modelo: string;
          cor: string | null;
          chassi: string;
          status: LocacaoVeiculoStatus;
          valor_diaria: number | null;
          observacoes: string | null;
          foto_url: string | null;
          km_atual: number | null;
          tipo_contrato: LocacaoTipoContrato;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tipo: LocacaoVeiculoTipo;
          marca: string;
          modelo: string;
          cor?: string | null;
          chassi: string;
          status?: LocacaoVeiculoStatus;
          valor_diaria?: number | null;
          observacoes?: string | null;
          foto_url?: string | null;
          km_atual?: number | null;
          tipo_contrato?: LocacaoTipoContrato;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tipo?: LocacaoVeiculoTipo;
          marca?: string;
          modelo?: string;
          cor?: string | null;
          chassi?: string;
          status?: LocacaoVeiculoStatus;
          valor_diaria?: number | null;
          observacoes?: string | null;
          foto_url?: string | null;
          km_atual?: number | null;
          tipo_contrato?: LocacaoTipoContrato;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      locacao_clientes: {
        Row: {
          id: string;
          nome: string;
          cpf: string | null;
          telefone: string | null;
          observacoes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          cpf?: string | null;
          telefone?: string | null;
          observacoes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          cpf?: string | null;
          telefone?: string | null;
          observacoes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      locacao_alugueis: {
        Row: {
          id: string;
          numero: number;
          veiculo_id: string;
          cliente_id: string;
          data_retirada: string;
          data_prevista_devolucao: string;
          data_devolucao_real: string | null;
          valor: number;
          forma_pagamento: LocacaoFormaPagamento;
          status_pagamento: LocacaoStatusPagamento;
          valor_pago: number;
          data_pagamento: string | null;
          km_inicio: number | null;
          km_fim: number | null;
          observacoes: string | null;
          diarias_extras_atraso: number;
          aceite_online_em: string | null;
          aceite_online_nome: string | null;
          aceite_online_telefone: string | null;
          aceite_online_ip: string | null;
          aceite_online_user_agent: string | null;
          aceite_online_fuso_horario: string | null;
          aceite_online_latitude: number | null;
          aceite_online_longitude: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          numero?: number;
          veiculo_id: string;
          cliente_id: string;
          data_retirada?: string;
          data_prevista_devolucao: string;
          data_devolucao_real?: string | null;
          valor?: number;
          forma_pagamento: LocacaoFormaPagamento;
          status_pagamento?: LocacaoStatusPagamento;
          valor_pago?: number;
          data_pagamento?: string | null;
          km_inicio?: number | null;
          km_fim?: number | null;
          observacoes?: string | null;
          diarias_extras_atraso?: number;
          aceite_online_em?: string | null;
          aceite_online_nome?: string | null;
          aceite_online_telefone?: string | null;
          aceite_online_ip?: string | null;
          aceite_online_user_agent?: string | null;
          aceite_online_fuso_horario?: string | null;
          aceite_online_latitude?: number | null;
          aceite_online_longitude?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          numero?: number;
          veiculo_id?: string;
          cliente_id?: string;
          data_retirada?: string;
          data_prevista_devolucao?: string;
          data_devolucao_real?: string | null;
          valor?: number;
          forma_pagamento?: LocacaoFormaPagamento;
          status_pagamento?: LocacaoStatusPagamento;
          valor_pago?: number;
          data_pagamento?: string | null;
          km_inicio?: number | null;
          km_fim?: number | null;
          observacoes?: string | null;
          diarias_extras_atraso?: number;
          aceite_online_em?: string | null;
          aceite_online_nome?: string | null;
          aceite_online_telefone?: string | null;
          aceite_online_ip?: string | null;
          aceite_online_user_agent?: string | null;
          aceite_online_fuso_horario?: string | null;
          aceite_online_latitude?: number | null;
          aceite_online_longitude?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      locacao_renovacoes: {
        Row: {
          id: string;
          aluguel_id: string;
          token: string;
          dias_adicionais: number;
          valor_adicional: number;
          nova_data_devolucao: string;
          status: string;
          expira_em: string;
          aceita_em: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          aluguel_id: string;
          token?: string;
          dias_adicionais: number;
          valor_adicional: number;
          nova_data_devolucao: string;
          status?: string;
          expira_em: string;
          aceita_em?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          aluguel_id?: string;
          token?: string;
          dias_adicionais?: number;
          valor_adicional?: number;
          nova_data_devolucao?: string;
          status?: string;
          expira_em?: string;
          aceita_em?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      locacao_despesas: {
        Row: {
          id: string;
          data: string;
          descricao: string;
          categoria: string | null;
          fornecedor: string | null;
          forma_pagamento: LocacaoFormaPagamento | null;
          valor: number;
          veiculo_id: string | null;
          km: number | null;
          observacoes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          data?: string;
          descricao: string;
          categoria?: string | null;
          fornecedor?: string | null;
          forma_pagamento?: LocacaoFormaPagamento | null;
          valor?: number;
          veiculo_id?: string | null;
          km?: number | null;
          observacoes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          data?: string;
          descricao?: string;
          categoria?: string | null;
          fornecedor?: string | null;
          forma_pagamento?: LocacaoFormaPagamento | null;
          valor?: number;
          veiculo_id?: string | null;
          km?: number | null;
          observacoes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      locacao_config: {
        Row: {
          id: number;
          saldo_inicial: number;
          data_inicio_caixa: string | null;
          extensao_atraso_ativo: boolean;
          extensao_atraso_horas: number;
          locadora_razao_social: string;
          locadora_cnpj: string;
          locadora_endereco: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          saldo_inicial?: number;
          data_inicio_caixa?: string | null;
          extensao_atraso_ativo?: boolean;
          extensao_atraso_horas?: number;
          locadora_razao_social?: string;
          locadora_cnpj?: string;
          locadora_endereco?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          saldo_inicial?: number;
          data_inicio_caixa?: string | null;
          extensao_atraso_ativo?: boolean;
          extensao_atraso_horas?: number;
          locadora_razao_social?: string;
          locadora_cnpj?: string;
          locadora_endereco?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      locacao_ajustes_caixa: {
        Row: {
          id: string;
          data: string;
          motivo: string;
          valor: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          data?: string;
          motivo: string;
          valor: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          data?: string;
          motivo?: string;
          valor?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      locacao_outras_entradas: {
        Row: {
          id: string;
          data: string;
          descricao: string;
          categoria: string | null;
          forma_pagamento: LocacaoFormaPagamento | null;
          valor: number;
          observacoes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          data?: string;
          descricao: string;
          categoria?: string | null;
          forma_pagamento?: LocacaoFormaPagamento | null;
          valor?: number;
          observacoes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          data?: string;
          descricao?: string;
          categoria?: string | null;
          forma_pagamento?: LocacaoFormaPagamento | null;
          valor?: number;
          observacoes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      locacao_aluguel_pagamentos: {
        Row: {
          id: string;
          aluguel_id: string;
          forma_pagamento: LocacaoFormaPagamento;
          valor: number;
          data: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          aluguel_id: string;
          forma_pagamento: LocacaoFormaPagamento;
          valor?: number;
          data?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          aluguel_id?: string;
          forma_pagamento?: LocacaoFormaPagamento;
          valor?: number;
          data?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      pessoal_renda: {
        Row: {
          id: string;
          mes: string;
          descricao: string;
          categoria: PessoalRendaCategoria;
          valor_previsto: number;
          valor_real: number | null;
          created_at: string;
          deletado_em: string | null;
        };
        Insert: {
          id?: string;
          mes: string;
          descricao: string;
          categoria?: PessoalRendaCategoria;
          valor_previsto?: number;
          valor_real?: number | null;
          created_at?: string;
          deletado_em?: string | null;
        };
        Update: {
          id?: string;
          mes?: string;
          descricao?: string;
          categoria?: PessoalRendaCategoria;
          valor_previsto?: number;
          valor_real?: number | null;
          created_at?: string;
          deletado_em?: string | null;
        };
        Relationships: [];
      };
      pessoal_itens_mes: {
        Row: {
          id: string;
          mes: string;
          secao: PessoalItemSecao;
          descricao: string;
          forma_pagamento: string | null;
          valor_previsto: number;
          valor_real: number | null;
          pago_em: string | null;
          created_at: string;
          deletado_em: string | null;
        };
        Insert: {
          id?: string;
          mes: string;
          secao: PessoalItemSecao;
          descricao: string;
          forma_pagamento?: string | null;
          valor_previsto?: number;
          valor_real?: number | null;
          pago_em?: string | null;
          created_at?: string;
          deletado_em?: string | null;
        };
        Update: {
          id?: string;
          mes?: string;
          secao?: PessoalItemSecao;
          descricao?: string;
          forma_pagamento?: string | null;
          valor_previsto?: number;
          valor_real?: number | null;
          pago_em?: string | null;
          created_at?: string;
          deletado_em?: string | null;
        };
        Relationships: [];
      };
      pessoal_cartoes: {
        Row: {
          id: string;
          nome: string;
          ativo: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          ativo?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          ativo?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      pessoal_cartao_lancamentos: {
        Row: {
          id: string;
          cartao_id: string;
          compra_id: string;
          mes: string;
          categoria: PessoalCartaoCategoria;
          descricao: string;
          parcela_atual: number;
          parcela_total: number;
          valor_previsto: number;
          valor_real: number | null;
          eh_fixa: boolean;
          repassado_em: string | null;
          created_at: string;
          deletado_em: string | null;
        };
        Insert: {
          id?: string;
          cartao_id: string;
          compra_id?: string;
          mes: string;
          categoria: PessoalCartaoCategoria;
          descricao: string;
          parcela_atual?: number;
          parcela_total?: number;
          valor_previsto?: number;
          valor_real?: number | null;
          eh_fixa?: boolean;
          repassado_em?: string | null;
          created_at?: string;
          deletado_em?: string | null;
        };
        Update: {
          id?: string;
          cartao_id?: string;
          compra_id?: string;
          mes?: string;
          categoria?: PessoalCartaoCategoria;
          descricao?: string;
          parcela_atual?: number;
          parcela_total?: number;
          valor_previsto?: number;
          valor_real?: number | null;
          eh_fixa?: boolean;
          repassado_em?: string | null;
          created_at?: string;
          deletado_em?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      vw_garantias: {
        Row: {
          os_id: string;
          numero: number;
          cliente_id: string;
          cliente_nome: string;
          equipamento_id: string | null;
          equipamento_tipo: string | null;
          equipamento_marca: string | null;
          data_finalizacao: string;
          data_inicio_garantia: string;
          garantia_dias: number;
          data_expiracao: string;
          dias_restantes: number;
          status_garantia: GarantiaStatus;
        };
        Relationships: [];
      };
    };
    Functions: {
      incrementar_quantidade_peca: {
        Args: { p_peca_id: string; p_delta: number };
        Returns: undefined;
      };
      registrar_tentativa_consulta_garantia: {
        Args: { p_ip: string };
        Returns: boolean;
      };
      processar_extensao_alugueis_atrasados: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      verificar_garantia: {
        Args: { p_os_id: string };
        Returns: {
          numero: number;
          equipamento_tipo: string | null;
          equipamento_marca: string | null;
          data_finalizacao: string;
          data_expiracao: string;
          status_garantia: GarantiaStatus;
          nome_empresa: string;
          logo_url: string | null;
        }[];
      };
      dados_publicos_empresa: {
        Args: Record<string, never>;
        Returns: {
          nome_empresa: string;
          telefone: string | null;
          endereco: string | null;
          logo_url: string | null;
          garantia_prazo_dias: number;
        }[];
      };
      consultar_garantias_por_telefone: {
        Args: { p_telefone: string };
        Returns: {
          os_id: string;
          numero: number;
          equipamento_tipo: string | null;
          equipamento_marca: string | null;
          data_finalizacao: string;
          data_expiracao: string;
          status_garantia: GarantiaStatus;
        }[];
      };
      verificar_contrato_locacao: {
        Args: { p_aluguel_id: string };
        Returns: {
          numero: number;
          cliente_nome: string;
          cliente_cpf: string | null;
          cliente_telefone: string | null;
          veiculo_tipo: string;
          veiculo_marca: string;
          veiculo_modelo: string;
          veiculo_cor: string | null;
          veiculo_chassi: string;
          veiculo_tipo_contrato: string;
          data_retirada: string;
          data_prevista_devolucao: string;
          valor: number;
          forma_pagamento: string;
          status_pagamento: string;
          observacoes: string | null;
          locadora_razao_social: string | null;
          locadora_cnpj: string | null;
          locadora_endereco: string | null;
        }[];
      };
      obter_renovacao_locacao: {
        Args: { p_token: string };
        Returns: {
          numero: number;
          cliente_nome: string;
          veiculo_marca: string;
          veiculo_modelo: string;
          data_atual_devolucao: string;
          dias_adicionais: number;
          valor_adicional: number;
          nova_data_devolucao: string;
          valor_atual: number;
          status: string;
        }[];
      };
      aceitar_renovacao_locacao: {
        Args: { p_token: string };
        Returns: { sucesso: boolean; mensagem: string }[];
      };
      obter_contrato_aceite: {
        Args: { p_aluguel_id: string };
        Returns: {
          numero: number;
          cliente_nome: string;
          status_pagamento: string;
          valor: number;
          valor_pago: number;
          aceite_online_em: string | null;
          aceite_online_nome: string | null;
        }[];
      };
      obter_contrato_aceite_completo: {
        Args: { p_aluguel_id: string };
        Returns: {
          numero: number;
          cliente_nome: string;
          status_pagamento: string;
          valor: number;
          valor_pago: number;
          aceite_online_em: string | null;
          aceite_online_nome: string | null;
          aceite_online_telefone: string | null;
          aceite_online_ip: string | null;
          aceite_online_user_agent: string | null;
        }[];
      };
      obter_contrato_aceite_completo_v2: {
        Args: { p_aluguel_id: string };
        Returns: {
          numero: number;
          cliente_nome: string;
          status_pagamento: string;
          valor: number;
          valor_pago: number;
          aceite_online_em: string | null;
          aceite_online_nome: string | null;
          aceite_online_telefone: string | null;
          aceite_online_ip: string | null;
          aceite_online_user_agent: string | null;
          aceite_online_fuso_horario: string | null;
          aceite_online_latitude: number | null;
          aceite_online_longitude: number | null;
        }[];
      };
      aceitar_contrato_locacao: {
        Args: {
          p_aluguel_id: string;
          p_nome: string;
          p_telefone: string;
          p_ip: string;
          p_user_agent: string;
          p_fuso_horario: string;
          p_latitude: number | null;
          p_longitude: number | null;
        };
        Returns: { sucesso: boolean; mensagem: string }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
