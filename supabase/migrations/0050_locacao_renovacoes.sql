-- ========== Renovação de aluguel por link (sem o cliente precisar voltar) ==========
-- O usuário gera um link (token aleatório, validade de 24h) pra um aluguel em
-- aberto, manda pro cliente (WhatsApp), e o cliente abre uma página pública
-- (/locacao/renovar/[token], sem login) com os novos termos e um botão
-- "Aceitar renovação". Ao aceitar, o próprio sistema estende a devolução
-- prevista e soma o valor adicional no aluguel — sem o cliente ir até a loja.
create table public.locacao_renovacoes (
  id uuid primary key default gen_random_uuid(),
  aluguel_id uuid not null references public.locacao_alugueis(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  dias_adicionais smallint not null,
  valor_adicional numeric not null,
  nova_data_devolucao timestamptz not null,
  status text not null default 'pendente' check (status in ('pendente', 'aceita', 'expirada', 'cancelada')),
  expira_em timestamptz not null,
  aceita_em timestamptz,
  created_at timestamptz not null default now()
);

create index locacao_renovacoes_aluguel_id_idx on public.locacao_renovacoes(aluguel_id);

alter table public.locacao_renovacoes enable row level security;
create policy "Acesso total para usuarios autenticados" on public.locacao_renovacoes
  for all to authenticated using (true) with check (true);

-- Leitura pública (pela página /locacao/renovar/[token]): função com
-- privilégio elevado devolvendo só os campos necessários pra exibir os
-- termos da renovação — mesmo padrão de verificar_contrato_locacao — em vez
-- de abrir policy de leitura anônima nas tabelas de locação.
create or replace function public.obter_renovacao_locacao(p_token uuid)
returns table (
  numero integer,
  cliente_nome text,
  veiculo_marca text,
  veiculo_modelo text,
  data_atual_devolucao timestamptz,
  dias_adicionais smallint,
  valor_adicional numeric,
  nova_data_devolucao timestamptz,
  valor_atual numeric,
  status text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    a.numero,
    c.nome,
    v.marca,
    v.modelo,
    a.data_prevista_devolucao,
    r.dias_adicionais,
    r.valor_adicional,
    r.nova_data_devolucao,
    a.valor,
    case when r.status = 'pendente' and now() > r.expira_em then 'expirada' else r.status end
  from public.locacao_renovacoes r
  join public.locacao_alugueis a on a.id = r.aluguel_id
  join public.locacao_clientes c on c.id = a.cliente_id
  join public.locacao_veiculos v on v.id = a.veiculo_id
  where r.token = p_token;
$$;

grant execute on function public.obter_renovacao_locacao(uuid) to anon, authenticated;

-- Aceite público: idempotente (clicar de novo numa renovação já aceita não
-- soma o valor duas vezes) e com trava de linha (for update) pra não aceitar
-- duas vezes em paralelo (duas abas, por exemplo). Nunca lança excessão —
-- devolve sucesso/mensagem, e quem chama decide o que mostrar.
create or replace function public.aceitar_renovacao_locacao(p_token uuid)
returns table (sucesso boolean, mensagem text)
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  select * into r from public.locacao_renovacoes where token = p_token for update;

  if r is null then
    return query select false, 'Link não encontrado';
    return;
  end if;

  if r.status = 'aceita' then
    return query select true, 'Renovação já estava confirmada';
    return;
  end if;

  if r.status <> 'pendente' or now() > r.expira_em then
    if r.status = 'pendente' then
      update public.locacao_renovacoes set status = 'expirada' where id = r.id;
    end if;
    return query select false, 'Link expirado ou cancelado';
    return;
  end if;

  update public.locacao_alugueis
  set data_prevista_devolucao = r.nova_data_devolucao,
      valor = valor + r.valor_adicional,
      updated_at = now()
  where id = r.aluguel_id;

  update public.locacao_renovacoes
  set status = 'aceita', aceita_em = now()
  where id = r.id;

  return query select true, 'Renovação confirmada';
end;
$$;

grant execute on function public.aceitar_renovacao_locacao(uuid) to anon, authenticated;
