-- =====================================================================
--  Carrinhos (ESP32) - parte 2: precos, valor por aluguel, limites
--  configuraveis e comandos remotos (zerar). Firmware 2.1.0.
--  Rodar DEPOIS do supabase_carrinhos.sql. Pode rodar mais de uma vez.
--  As funcoes antigas (v2.0) continuam funcionando, para os carrinhos
--  ainda na versao 2.0 conseguirem receber a atualizacao.
-- =====================================================================

-- 1) Configuracao da frota: precos e limites --------------------------------
alter table public.locacao_dispositivo_config
  add column if not exists preco_cartao_15min numeric(10,2) not null default 0,
  add column if not exists preco_cartao_5min  numeric(10,2) not null default 0,
  add column if not exists preco_livre_hora   numeric(10,2) not null default 0,
  add column if not exists bateria_minima numeric(4,1) not null default 22.0
    check (bateria_minima between 0 and 40),
  add column if not exists bateria_aviso  numeric(4,1) not null default 23.0
    check (bateria_aviso between 0 and 40),
  add column if not exists tempo_max_min  integer not null default 60
    check (tempo_max_min between 10 and 120),
  add column if not exists livre_max_min  integer not null default 300
    check (livre_max_min between 10 and 720);

-- 2) Comandos remotos por carrinho ----------------------------------------
create sequence if not exists public.locacao_dispositivo_comando_seq;

alter table public.locacao_dispositivos
  add column if not exists comando text
    check (comando in ('zerar_contadores', 'zerar_tudo')),
  add column if not exists comando_id bigint,
  add column if not exists comando_criado_em timestamptz,
  add column if not exists comando_executado_em timestamptz,
  add column if not exists comando_ultimo text,
  add column if not exists em_uso boolean not null default false;

-- 3) Sessoes: quantidade de cartoes, valor e ligacao com o caixa ------------
alter table public.locacao_dispositivo_sessoes
  add column if not exists qtd_15min integer not null default 0,
  add column if not exists qtd_5min  integer not null default 0,
  add column if not exists valor numeric(10,2) not null default 0,
  add column if not exists entrada_id uuid
    references public.locacao_outras_entradas(id) on delete set null;

-- sessoes antigas: 1 cartao do tipo que iniciou
update public.locacao_dispositivo_sessoes
set qtd_15min = case when cartao_tipo = '15MIN' then 1 else 0 end,
    qtd_5min  = case when cartao_tipo = '5MIN'  then 1 else 0 end
where qtd_15min = 0 and qtd_5min = 0 and cartao_tipo in ('15MIN', '5MIN');

-- 4) Valor de um aluguel com os precos atuais -------------------------------
create or replace function public.locacao_carrinho_valor(
  p_cartao_tipo text, p_qtd_15min integer, p_qtd_5min integer, p_minutos integer
) returns numeric
language sql
stable
set search_path = public
as $$
  select case
    when p_cartao_tipo = 'LIVRE'
      then round(coalesce(p_minutos, 0) * c.preco_livre_hora / 60.0, 2)
    else coalesce(p_qtd_15min, 0) * c.preco_cartao_15min
       + coalesce(p_qtd_5min, 0)  * c.preco_cartao_5min
  end
  from public.locacao_dispositivo_config c
  where c.id = 1;
$$;

-- 5) Pedir um comando a um carrinho (usado pela tela, usuario logado) -------
create or replace function public.dispositivo_enviar_comando(
  p_dispositivo_id uuid, p_comando text
) returns bigint
language plpgsql
set search_path = public
as $$
declare
  v_id bigint := nextval('public.locacao_dispositivo_comando_seq');
begin
  if p_comando not in ('zerar_contadores', 'zerar_tudo') then
    raise exception 'Comando invalido';
  end if;
  update public.locacao_dispositivos
  set comando = p_comando, comando_id = v_id,
      comando_criado_em = now(), comando_executado_em = null, updated_at = now()
  where id = p_dispositivo_id;
  if not found then
    raise exception 'Dispositivo nao encontrado';
  end if;
  return v_id;
end;
$$;
revoke all on function public.dispositivo_enviar_comando(uuid, text) from public;
grant execute on function public.dispositivo_enviar_comando(uuid, text) to authenticated;

-- 6) Heartbeat v2 (firmware 2.1+) -------------------------------------------
create or replace function public.dispositivo_heartbeat_v2(
  p_device_token uuid,
  p_firmware_versao text,
  p_tensao_bateria numeric,
  p_horimetro_minutos integer,
  p_contador_15min integer,
  p_contador_5min integer,
  p_contador_livre integer,
  p_fila_pendente integer,
  p_comando_executado bigint,
  p_em_uso boolean
) returns table (
  minutos_cartao_15min integer,
  minutos_cartao_5min integer,
  firmware_versao_alvo text,
  firmware_url text,
  tempo_max_min integer,
  livre_max_min integer,
  bateria_minima numeric,
  bateria_aviso numeric,
  comando text,
  comando_id bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  update public.locacao_dispositivos d
  set firmware_versao   = p_firmware_versao,
      tensao_bateria    = p_tensao_bateria,
      horimetro_minutos = p_horimetro_minutos,
      contador_15min    = p_contador_15min,
      contador_5min     = p_contador_5min,
      contador_livre    = p_contador_livre,
      fila_pendente     = p_fila_pendente,
      em_uso            = coalesce(p_em_uso, false),
      ultima_conexao    = now(),
      updated_at        = now()
  where d.device_token = p_device_token
  returning d.id into v_id;

  if v_id is null then
    raise exception 'Dispositivo nao encontrado';
  end if;

  -- o carrinho confirmou o comando: limpa o pedido
  if coalesce(p_comando_executado, 0) > 0 then
    update public.locacao_dispositivos d
    set comando_ultimo = d.comando,
        comando = null,
        comando_executado_em = now()
    where d.id = v_id and d.comando_id = p_comando_executado and d.comando is not null;
  end if;

  return query
    select c.minutos_cartao_15min, c.minutos_cartao_5min, c.firmware_versao_alvo, c.firmware_url,
           c.tempo_max_min, c.livre_max_min, c.bateria_minima, c.bateria_aviso,
           d.comando, case when d.comando is null then null else d.comando_id end
    from public.locacao_dispositivo_config c
    cross join public.locacao_dispositivos d
    where c.id = 1 and d.id = v_id;
end;
$$;

-- 7) Registrar aluguel v2 (com quantidade de cartoes e valor) ---------------
create or replace function public.dispositivo_registrar_sessao_v2(
  p_device_token uuid,
  p_uid text,
  p_cartao_tipo text,
  p_iniciado_em timestamptz,
  p_finalizado_em timestamptz,
  p_minutos integer,
  p_minutos_liberados integer,
  p_motivo_termino text,
  p_quedas_energia integer,
  p_qtd_15min integer,
  p_qtd_5min integer
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dispositivo_id uuid;
begin
  select d.id into v_dispositivo_id
  from public.locacao_dispositivos d
  where d.device_token = p_device_token;

  if v_dispositivo_id is null then
    raise exception 'Dispositivo nao encontrado';
  end if;

  insert into public.locacao_dispositivo_sessoes
    (dispositivo_id, uid, cartao_tipo, iniciado_em, finalizado_em, minutos,
     minutos_liberados, motivo_termino, quedas_energia, qtd_15min, qtd_5min, valor)
  values
    (v_dispositivo_id, p_uid, p_cartao_tipo, p_iniciado_em, p_finalizado_em, p_minutos,
     p_minutos_liberados, p_motivo_termino, p_quedas_energia,
     coalesce(p_qtd_15min, 0), coalesce(p_qtd_5min, 0),
     public.locacao_carrinho_valor(p_cartao_tipo, p_qtd_15min, p_qtd_5min, p_minutos))
  on conflict (uid) do nothing;
end;
$$;

revoke all on function public.dispositivo_heartbeat_v2(uuid, text, numeric, integer, integer, integer, integer, integer, bigint, boolean) from public;
revoke all on function public.dispositivo_registrar_sessao_v2(uuid, text, text, timestamptz, timestamptz, integer, integer, text, integer, integer, integer) from public;
grant execute on function public.dispositivo_heartbeat_v2(uuid, text, numeric, integer, integer, integer, integer, integer, bigint, boolean) to anon, authenticated;
grant execute on function public.dispositivo_registrar_sessao_v2(uuid, text, text, timestamptz, timestamptz, integer, integer, text, integer, integer, integer) to anon, authenticated;

-- a funcao v2.0 de sessao tambem passa a calcular o valor
create or replace function public.dispositivo_registrar_sessao(
  p_device_token uuid, p_uid text, p_cartao_tipo text,
  p_iniciado_em timestamptz, p_finalizado_em timestamptz, p_minutos integer,
  p_minutos_liberados integer, p_motivo_termino text, p_quedas_energia integer
) returns void
language sql
security definer
set search_path = public
as $$
  select public.dispositivo_registrar_sessao_v2(
    p_device_token, p_uid, p_cartao_tipo, p_iniciado_em, p_finalizado_em, p_minutos,
    p_minutos_liberados, p_motivo_termino, p_quedas_energia,
    case when p_cartao_tipo = '15MIN' then 1 else 0 end,
    case when p_cartao_tipo = '5MIN'  then 1 else 0 end);
$$;

-- 8) Faturamento por dia e por carrinho (fuso America/Sao_Paulo) -----------
create or replace view public.locacao_carrinhos_faturamento_diario
with (security_invoker = true) as
select
  (coalesce(s.finalizado_em, s.created_at) at time zone 'America/Sao_Paulo')::date as dia,
  d.id as dispositivo_id,
  d.numero_carrinho,
  count(*)                                         as alugueis,
  count(*) filter (where s.cartao_tipo = 'LIVRE')  as alugueis_livre,
  sum(s.qtd_15min)                                 as cartoes_15min,
  sum(s.qtd_5min)                                  as cartoes_5min,
  sum(s.minutos)                                   as minutos_rodados,
  sum(s.valor)                                     as valor_total,
  sum(s.valor) filter (where s.entrada_id is null) as valor_sem_lancamento
from public.locacao_dispositivo_sessoes s
join public.locacao_dispositivos d on d.id = s.dispositivo_id
group by 1, 2, 3;
grant select on public.locacao_carrinhos_faturamento_diario to authenticated;
