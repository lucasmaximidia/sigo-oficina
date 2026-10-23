-- ========== IP e dispositivo no aceite do contrato online ==========
-- Além de nome e telefone, registra o IP e o user-agent (navegador/
-- dispositivo) de quem aceitou o contrato — junto com a data/hora já
-- registrada, serve de evidência de quando e de onde o aceite aconteceu.
--
-- Função nova (sobrecarga com 5 argumentos) em vez de alterar a existente,
-- e obter_contrato_aceite_completo como função nova (não dá pra alterar o
-- retorno de obter_contrato_aceite via CREATE OR REPLACE sem DROP) — mesmo
-- motivo das migrações anteriores: evita precisar de DROP FUNCTION numa
-- função já em produção.
alter table public.locacao_alugueis add column if not exists aceite_online_ip text;
alter table public.locacao_alugueis add column if not exists aceite_online_user_agent text;

create or replace function public.aceitar_contrato_locacao(
  p_aluguel_id uuid, p_nome text, p_telefone text, p_ip text, p_user_agent text
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
      aceite_online_ip = p_ip, aceite_online_user_agent = p_user_agent
  where id = r.id;

  return query select true, 'Contrato aceito';
end;
$$;

grant execute on function public.aceitar_contrato_locacao(uuid, text, text, text, text) to anon, authenticated;

create or replace function public.obter_contrato_aceite_completo(p_aluguel_id uuid)
returns table (
  numero integer, cliente_nome text, status_pagamento text, valor numeric, valor_pago numeric,
  aceite_online_em timestamptz, aceite_online_nome text, aceite_online_telefone text,
  aceite_online_ip text, aceite_online_user_agent text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    a.numero, c.nome, a.status_pagamento, a.valor, a.valor_pago,
    a.aceite_online_em, a.aceite_online_nome, a.aceite_online_telefone,
    a.aceite_online_ip, a.aceite_online_user_agent
  from public.locacao_alugueis a
  join public.locacao_clientes c on c.id = a.cliente_id
  where a.id = p_aluguel_id;
$$;

grant execute on function public.obter_contrato_aceite_completo(uuid) to anon, authenticated;
