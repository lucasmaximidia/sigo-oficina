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
export type RetiradaTipo = "mao_de_obra" | "pagamento_parceiro" | "outro";

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
          valor: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          venda_id: string;
          forma_pagamento: FormaPagamento;
          valor?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          venda_id?: string;
          forma_pagamento?: FormaPagamento;
          valor?: number;
          created_at?: string;
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
          data_pagamento?: string | null;
          created_at?: string;
          updated_at?: string;
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
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
