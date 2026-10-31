-- Quadriciclo elétrico infantil: um novo tipo de veículo, que usa um
-- contrato diferente (direcionado ao responsável legal pela criança, não ao
-- condutor) — ver lib/locacao-contrato-texto.ts. tipo_contrato existe à
-- parte de `tipo` porque o mesmo contrato pode servir outros tipos de
-- veículo no futuro. Default 'padrao' preserva o contrato 1 pros veículos
-- já cadastrados (scooters e bicicletas).
alter table public.locacao_veiculos
  drop constraint locacao_veiculos_tipo_check,
  add constraint locacao_veiculos_tipo_check
    check (tipo in ('scooter', 'bicicleta', 'quadriciclo'));

alter table public.locacao_veiculos
  add column tipo_contrato text not null default 'padrao'
    check (tipo_contrato in ('padrao', 'infantil'));

-- verificar_contrato_locacao precisa devolver tipo_contrato pra página
-- pública do contrato saber qual texto mostrar — adicionar uma coluna ao
-- retorno de uma função existente exige DROP antes do CREATE OR REPLACE.
drop function if exists public.verificar_contrato_locacao(uuid);

create function public.verificar_contrato_locacao(p_aluguel_id uuid)
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
  veiculo_tipo_contrato text,
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
stable
security definer
set search_path = public
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
    v.tipo_contrato,
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
