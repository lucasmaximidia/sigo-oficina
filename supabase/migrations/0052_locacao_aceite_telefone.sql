-- ========== Telefone no aceite do contrato online ==========
-- Além do nome, o cliente agora também confirma o telefone ao aceitar o
-- contrato online — reforça a validade do aceite (quem recebe o link pelo
-- WhatsApp confirma seus próprios dados, em vez de só clicar num botão).
--
-- Função nova (sobrecarga com 3 argumentos) em vez de alterar a existente:
-- evita precisar de DROP FUNCTION numa função já em produção. A versão de 2
-- argumentos fica sem uso a partir daqui, mas não atrapalha ninguém.
alter table public.locacao_alugueis add column if not exists aceite_online_telefone text;

create or replace function public.aceitar_contrato_locacao(p_aluguel_id uuid, p_nome text, p_telefone text)
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
  set aceite_online_em = now(), aceite_online_nome = nome_limpo, aceite_online_telefone = telefone_limpo
  where id = r.id;

  return query select true, 'Contrato aceito';
end;
$$;

grant execute on function public.aceitar_contrato_locacao(uuid, text, text) to anon, authenticated;
