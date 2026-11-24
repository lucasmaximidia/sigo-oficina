-- =====================================================================
--  Carrinhos (ESP32) - parte 3: redes Wi-Fi gerenciadas pelo SIGO
--  Firmware 2.2.0. Rodar DEPOIS do supabase_carrinhos_v2.sql.
--  Pode rodar mais de uma vez. Nao altera as funcoes v1/v2.
-- =====================================================================

-- 1) Redes Wi-Fi da frota (os carrinhos guardam ate 5) -------------------
create table if not exists public.locacao_dispositivo_redes (
  id uuid primary key default gen_random_uuid(),
  ssid  text not null check (char_length(ssid) between 1 and 32),
  senha text not null default '' check (char_length(senha) <= 64),
  ativo boolean not null default true,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.locacao_dispositivo_redes enable row level security;
drop policy if exists "Acesso total para usuarios autenticados" on public.locacao_dispositivo_redes;
create policy "Acesso total para usuarios autenticados" on public.locacao_dispositivo_redes
  for all to authenticated using (true) with check (true);

-- 2) Heartbeat v3 = v2 + lista de redes ---------------------------------
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
  redes_hash text
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
         md5(coalesce((select string_agg(r.ssid || chr(9) || r.senha, chr(10) order by r.ordem, r.created_at) from r), ''))
  from public.dispositivo_heartbeat_v2(
    p_device_token, p_firmware_versao, p_tensao_bateria, p_horimetro_minutos,
    p_contador_15min, p_contador_5min, p_contador_livre, p_fila_pendente,
    p_comando_executado, p_em_uso) h;
$$;

revoke all on function public.dispositivo_heartbeat_v3(uuid, text, numeric, integer, integer, integer, integer, integer, bigint, boolean) from public;
grant execute on function public.dispositivo_heartbeat_v3(uuid, text, numeric, integer, integer, integer, integer, integer, bigint, boolean) to anon, authenticated;
