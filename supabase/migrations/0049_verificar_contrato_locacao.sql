-- ========== Contrato de locação público (sem login) ==========
-- A tela /locacao/contrato/[id] é acessada pelo cliente via QR code no
-- contrato em PDF (que agora cabe numa página só, com um resumo das
-- cláusulas — o contrato completo fica atrás desse link/QR). Mesmo padrão
-- de verificar_garantia: função com privilégio elevado (security definer)
-- devolvendo só os campos necessários, em vez de abrir policy de leitura
-- anônima nas tabelas em si.
create or replace function public.verificar_contrato_locacao(p_aluguel_id uuid)
returns table (
  numero integer,
  cliente_nome text,
  cliente_cpf text,
  cliente_telefone text,
  veiculo_tipo text,
  veiculo_marca text,
  veiculo_modelo text,
  veiculo_cor text,
  veiculo_chassi text,
  data_retirada timestamptz,
  data_prevista_devolucao timestamptz,
  valor numeric,
  forma_pagamento text,
  status_pagamento text,
  observacoes text,
  locadora_razao_social text,
  locadora_cnpj text,
  locadora_endereco text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    a.numero,
    c.nome,
    c.cpf,
    c.telefone,
    v.tipo,
    v.marca,
    v.modelo,
    v.cor,
    v.chassi,
    a.data_retirada,
    a.data_prevista_devolucao,
    a.valor,
    a.forma_pagamento,
    a.status_pagamento,
    a.observacoes,
    cfg.locadora_razao_social,
    cfg.locadora_cnpj,
    cfg.locadora_endereco
  from public.locacao_alugueis a
  join public.locacao_clientes c on c.id = a.cliente_id
  join public.locacao_veiculos v on v.id = a.veiculo_id
  left join public.locacao_config cfg on cfg.id = 1
  where a.id = p_aluguel_id;
$$;

grant execute on function public.verificar_contrato_locacao(uuid) to anon, authenticated;
