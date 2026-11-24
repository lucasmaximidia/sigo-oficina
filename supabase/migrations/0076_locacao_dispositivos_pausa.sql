-- =====================================================================
--  Carrinhos (ESP32) - parte 4: cartao PAUSA e pausa maxima configuravel
--  Firmware 2.3.0. Rodar DEPOIS do supabase_carrinhos_v3.sql.
--  Pode rodar mais de uma vez. Carrinhos na 2.2 continuam funcionando.
-- =====================================================================

-- 1) Pausa maxima (minutos). 0 = sem limite. Padrao: 2 min ----------------
alter table public.locacao_dispositivo_config
  add column if not exists pausa_max_min integer not null default 2
    check (pausa_max_min between 0 and 60);

-- 2) Novo motivo de termino: 'pausa' (encerrado por pausa longa) ----------
alter table public.locacao_dispositivo_sessoes
  drop constraint if exists locacao_dispositivo_sessoes_motivo_termino_check;
alter table public.locacao_dispositivo_sessoes
  add constraint locacao_dispositivo_sessoes_motivo_termino_check
  check (motivo_termino in ('tempo', 'fim', 'pausa'));

-- 3) Heartbeat v3 passa a devolver tambem pausa_max_min -------------------
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
  pausa_max_min integer
)
language sql
security definer
set search_path = public
as $$
  with r as (
    select ssid, senha, ordem, created_at
    from public.locacao_dispositivo_redes
    where ativo
    order by ordem, created_at
    limit 5
  )
  select h.*,
         coalesce((select jsonb_agg(jsonb_build_object('s', r.ssid, 'p', r.senha) order by r.ordem, r.created_at) from r), '[]'::jsonb),
         md5(coalesce((select string_agg(r.ssid || chr(9) || r.senha, chr(10) order by r.ordem, r.created_at) from r), '')),
         (select c.pausa_max_min from public.locacao_dispositivo_config c where c.id = 1)
  from public.dispositivo_heartbeat_v2(
    p_device_token, p_firmware_versao, p_tensao_bateria, p_horimetro_minutos,
    p_contador_15min, p_contador_5min, p_contador_livre, p_fila_pendente,
    p_comando_executado, p_em_uso) h;
$$;

revoke all on function public.dispositivo_heartbeat_v3(uuid, text, numeric, integer, integer, integer, integer, integer, bigint, boolean) from public;
grant execute on function public.dispositivo_heartbeat_v3(uuid, text, numeric, integer, integer, integer, integer, integer, bigint, boolean) to anon, authenticated;
