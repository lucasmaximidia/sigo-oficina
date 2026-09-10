-- Site institucional público + consulta de garantia por telefone (sem login).
-- `configuracoes` e `vw_garantias` têm RLS restrito a usuários autenticados
-- (ver 0029_auth_rls.sql) — as duas funções abaixo seguem o mesmo padrão de
-- `verificar_garantia`: security definer, devolvendo só os campos
-- necessários para as telas públicas, sem abrir policy de leitura anônima
-- nas tabelas em si.

-- ========== Dados públicos da empresa (header/rodapé do site) ==========
create or replace function public.dados_publicos_empresa()
returns table (
  nome_empresa text,
  telefone text,
  endereco text,
  logo_url text,
  garantia_prazo_dias integer
)
language sql
security definer
set search_path = public
stable
as $$
  select nome_empresa, telefone, endereco, logo_url, garantia_prazo_dias
  from public.configuracoes
  where id = 1;
$$;

grant execute on function public.dados_publicos_empresa() to anon, authenticated;

-- ========== Consulta de garantias por telefone (cliente, sem login) ==========
create or replace function public.consultar_garantias_por_telefone(p_telefone text)
returns table (
  os_id uuid,
  numero integer,
  equipamento_tipo text,
  equipamento_marca text,
  data_finalizacao date,
  data_expiracao timestamptz,
  status_garantia text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    v.os_id,
    v.numero,
    v.equipamento_tipo,
    v.equipamento_marca,
    v.data_finalizacao,
    v.data_expiracao,
    v.status_garantia
  from public.vw_garantias v
  join public.clientes c on c.id = v.cliente_id
  where length(regexp_replace(coalesce(p_telefone, ''), '\D', '', 'g')) >= 10
    and regexp_replace(c.telefone, '\D', '', 'g') = regexp_replace(p_telefone, '\D', '', 'g')
  order by v.data_finalizacao desc;
$$;

grant execute on function public.consultar_garantias_por_telefone(text) to anon, authenticated;
