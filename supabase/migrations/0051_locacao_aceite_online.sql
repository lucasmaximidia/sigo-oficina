-- ========== Aceite do contrato online (contratação, não só renovação) ==========
-- Além do contrato impresso (PDF), o usuário pode mandar o link público do
-- contrato (/locacao/contrato/[id]) direto pro cliente aceitar — com uma
-- caixa de ciência + nome digitado como confirmação (não é uma assinatura
-- certificada, mas registra quando e por quem foi aceito). Depois do
-- aceite, a mesma página mostra o status do pagamento (confirmado ou
-- aguardando), sem o cliente precisar voltar na loja.
--
-- Os campos de aceite ficam numa função nova (obter_contrato_aceite), em vez
-- de estender verificar_contrato_locacao — mudar o retorno de uma função já
-- existente exige DROP FUNCTION antes do CREATE OR REPLACE, e preferimos não
-- tocar numa função que já está em produção.
alter table public.locacao_alugueis add column if not exists aceite_online_em timestamptz;
alter table public.locacao_alugueis add column if not exists aceite_online_nome text;

create or replace function public.obter_contrato_aceite(p_aluguel_id uuid)
returns table (
  numero integer,
  cliente_nome text,
  status_pagamento text,
  valor numeric,
  valor_pago numeric,
  aceite_online_em timestamptz,
  aceite_online_nome text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    a.numero,
    c.nome,
    a.status_pagamento,
    a.valor,
    a.valor_pago,
    a.aceite_online_em,
    a.aceite_online_nome
  from public.locacao_alugueis a
  join public.locacao_clientes c on c.id = a.cliente_id
  where a.id = p_aluguel_id;
$$;

grant execute on function public.obter_contrato_aceite(uuid) to anon, authenticated;

-- Aceite público: idempotente (clicar de novo numa já aceita não sobrescreve
-- nome/data), nunca lança excessão (devolve sucesso/mensagem).
create or replace function public.aceitar_contrato_locacao(p_aluguel_id uuid, p_nome text)
returns table (sucesso boolean, mensagem text)
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  nome_limpo text;
begin
  nome_limpo := trim(p_nome);
  if nome_limpo = '' then
    return query select false, 'Informe o nome completo';
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
  set aceite_online_em = now(), aceite_online_nome = nome_limpo
  where id = p_aluguel_id;

  return query select true, 'Contrato aceito';
end;
$$;

grant execute on function public.aceitar_contrato_locacao(uuid, text) to anon, authenticated;
