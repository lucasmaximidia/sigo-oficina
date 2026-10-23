-- ========== Fuso horário e localização no aceite do contrato online ==========
-- Fuso horário do dispositivo (não dá pra ler isso do servidor, só o
-- próprio navegador sabe) e localização por GPS, pedida ao cliente por uma
-- caixinha obrigatória no formulário — mas sem travar o aceite se o
-- navegador negar ou a localização falhar: fica só sem coordenadas.
--
-- Função nova (sobrecarga com 8 argumentos) em vez de alterar a existente,
-- e obter_contrato_aceite_completo_v2 como função nova (mesmo motivo das
-- migrações anteriores: evita precisar de DROP FUNCTION numa função já em
-- produção).
alter table public.locacao_alugueis add column if not exists aceite_online_fuso_horario text;
alter table public.locacao_alugueis add column if not exists aceite_online_latitude double precision;
alter table public.locacao_alugueis add column if not exists aceite_online_longitude double precision;

create or replace function public.aceitar_contrato_locacao(
  p_aluguel_id uuid, p_nome text, p_telefone text, p_ip text, p_user_agent text,
  p_fuso_horario text, p_latitude double precision, p_longitude double precision
)
returns table (sucesso boolean, mensagem text)
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  nome_limpo text;
  telefone_limpo text;
begin
  nome_limpo := trim(p_nome);
  telefone_limpo := trim(p_telefone);
  if nome_limpo = '' or telefone_limpo = '' then
    return query select false, 'Informe nome e telefone';
    return;
  end if;

  select * into r from public.locacao_alugueis where id = p_aluguel_id for update;

  if r is null then
    return query select false, 'Aluguel não encontrado';
    return;
  end if;

  if r.aceite_online_em is not null then
    return query select true, 'Contrato já estava aceito';
    return;
  end if;

  update public.locacao_alugueis
  set aceite_online_em = now(), aceite_online_nome = nome_limpo, aceite_online_telefone = telefone_limpo,
      aceite_online_ip = p_ip, aceite_online_user_agent = p_user_agent,
      aceite_online_fuso_horario = p_fuso_horario, aceite_online_latitude = p_latitude, aceite_online_longitude = p_longitude
  where id = r.id;

  return query select true, 'Contrato aceito';
end;
$$;

grant execute on function public.aceitar_contrato_locacao(uuid, text, text, text, text, text, double precision, double precision) to anon, authenticated;

create or replace function public.obter_contrato_aceite_completo_v2(p_aluguel_id uuid)
returns table (
  numero integer, cliente_nome text, status_pagamento text, valor numeric, valor_pago numeric,
  aceite_online_em timestamptz, aceite_online_nome text, aceite_online_telefone text,
  aceite_online_ip text, aceite_online_user_agent text,
  aceite_online_fuso_horario text, aceite_online_latitude double precision, aceite_online_longitude double precision
)
language sql
stable
security definer
set search_path = public
as $$
  select
    a.numero, c.nome, a.status_pagamento, a.valor, a.valor_pago,
    a.aceite_online_em, a.aceite_online_nome, a.aceite_online_telefone,
    a.aceite_online_ip, a.aceite_online_user_agent,
    a.aceite_online_fuso_horario, a.aceite_online_latitude, a.aceite_online_longitude
  from public.locacao_alugueis a
  join public.locacao_clientes c on c.id = a.cliente_id
  where a.id = p_aluguel_id;
$$;

grant execute on function public.obter_contrato_aceite_completo_v2(uuid) to anon, authenticated;
