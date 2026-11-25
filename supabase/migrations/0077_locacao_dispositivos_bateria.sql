-- =====================================================================
--  Carrinhos (ESP32) - parte 5: bateria POR CARRINHO
--  - tipo de bateria de cada carrinho: chumbo, litio (Li-ion 7S) ou lifepo4 (8S)
--  - bateria minima e aviso proprios de cada carrinho (vazio = usa o da frota)
--  Rodar DEPOIS do supabase_carrinhos_v4.sql. Pode rodar mais de uma vez.
--  Carrinhos na 2.3 ja recebem os limites por carrinho (ignoram o tipo).
--  Carrinhos na 2.4 usam tambem o tipo para calcular a % do cartao BAT.
-- =====================================================================

-- 1) Colunas novas em cada carrinho ----------------------------------------
alter table public.locacao_dispositivos
  add column if not exists tipo_bateria text not null default 'chumbo',
  add column if not exists bateria_minima numeric(4,1),
  add column if not exists bateria_aviso numeric(4,1);

alter table public.locacao_dispositivos
  drop constraint if exists locacao_dispositivos_tipo_bateria_check,
  drop constraint if exists locacao_dispositivos_bateria_minima_check,
  drop constraint if exists locacao_dispositivos_bateria_aviso_check;
alter table public.locacao_dispositivos
  add constraint locacao_dispositivos_tipo_bateria_check
    check (tipo_bateria in ('chumbo', 'litio', 'lifepo4')),
  add constraint locacao_dispositivos_bateria_minima_check
    check (bateria_minima is null or bateria_minima between 0 and 40),
  add constraint locacao_dispositivos_bateria_aviso_check
    check (bateria_aviso is null or bateria_aviso between 0 and 40);

comment on column public.locacao_dispositivos.tipo_bateria is 'chumbo | litio (Li-ion 7S) | lifepo4 (8S)';
comment on column public.locacao_dispositivos.bateria_minima is 'Volts. Vazio = usa locacao_dispositivo_config.bateria_minima. 0 = desliga o bloqueio';
comment on column public.locacao_dispositivos.bateria_aviso is 'Volts. Vazio = usa locacao_dispositivo_config.bateria_aviso. 0 = desliga o aviso';

-- 2) Heartbeat v3: limites do carrinho por cima dos da frota + tipo ---------
--    (o tipo de retorno mudou: precisa apagar e criar de novo)
drop function if exists public.dispositivo_heartbeat_v3(uuid, text, numeric, integer, integer, integer, integer, integer, bigint, boolean);

create or replace function public.dispositivo_heartbeat_v3(
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
  comando_id bigint,
  redes jsonb,
  redes_hash text,
  pausa_max_min integer,
  tipo_bateria text
)
language sql
security definer
set search_path = public
as $$
  with h as materialized (
    select * from public.dispositivo_heartbeat_v2(
      p_device_token, p_firmware_versao, p_tensao_bateria, p_horimetro_minutos,
      p_contador_15min, p_contador_5min, p_contador_livre, p_fila_pendente,
      p_comando_executado, p_em_uso)
  ),
  r as (
    select ssid, senha, ordem, created_at
    from public.locacao_dispositivo_redes
    where ativo
    order by ordem, created_at
    limit 5
  )
  select h.minutos_cartao_15min, h.minutos_cartao_5min, h.firmware_versao_alvo, h.firmware_url,
         h.tempo_max_min, h.livre_max_min,
         coalesce(d.bateria_minima, h.bateria_minima),
         coalesce(d.bateria_aviso, h.bateria_aviso),
         h.comando, h.comando_id,
         coalesce((select jsonb_agg(jsonb_build_object('s', r.ssid, 'p', r.senha) order by r.ordem, r.created_at) from r), '[]'::jsonb),
         md5(coalesce((select string_agg(r.ssid || chr(9) || r.senha, chr(10) order by r.ordem, r.created_at) from r), '')),
         (select c.pausa_max_min from public.locacao_dispositivo_config c where c.id = 1),
         d.tipo_bateria
  from h
  left join public.locacao_dispositivos d on d.device_token = p_device_token;
$$;

revoke all on function public.dispositivo_heartbeat_v3(uuid, text, numeric, integer, integer, integer, integer, integer, bigint, boolean) from public;
grant execute on function public.dispositivo_heartbeat_v3(uuid, text, numeric, integer, integer, integer, integer, integer, bigint, boolean) to anon, authenticated;
