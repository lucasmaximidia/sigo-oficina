-- =====================================================================
--  Controle de Tempo dos carrinhos (ESP32) -> SIGO / Locacao (Supabase)
--  Baseado no relatorio tecnico, com ajustes para o firmware v2.0:
--   - contadores enviados pelo proprio carrinho (valor absoluto)
--   - uid por aluguel (evita duplicar se a internet cair no meio)
--   - horarios podem vir nulos (carrinho sem relogio acertado)
--   - minutos liberados, quedas de energia e link do firmware
-- =====================================================================

-- 1) Um ESP32 por carrinho ------------------------------------------------
create table if not exists public.locacao_dispositivos (
  id uuid primary key default gen_random_uuid(),
  veiculo_id uuid references public.locacao_veiculos(id) on delete set null,
  numero_carrinho integer not null unique,
  device_token uuid not null unique default gen_random_uuid(),   -- segredo do carrinho
  firmware_versao text,
  ultima_conexao timestamptz,
  tensao_bateria numeric(5,2),
  horimetro_minutos integer not null default 0,
  contador_15min integer not null default 0,
  contador_5min integer not null default 0,
  contador_livre integer not null default 0,
  fila_pendente integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Um registro por aluguel (passeio) ------------------------------------
create table if not exists public.locacao_dispositivo_sessoes (
  id uuid primary key default gen_random_uuid(),
  dispositivo_id uuid not null references public.locacao_dispositivos(id) on delete cascade,
  uid text not null unique,                       -- "<mac>-<seq>", gerado no carrinho
  cartao_tipo text not null check (cartao_tipo in ('15MIN', '5MIN', 'LIVRE')),
  iniciado_em timestamptz,                        -- pode ser nulo (relogio nao acertado)
  finalizado_em timestamptz,
  minutos integer not null,                       -- minutos realmente rodados (sem pausas)
  minutos_liberados integer not null default 0,   -- minutos vendidos (0 no LIVRE)
  motivo_termino text not null check (motivo_termino in ('tempo', 'fim')),
  quedas_energia integer not null default 0,      -- vezes que a energia caiu no aluguel
  created_at timestamptz not null default now()
);
create index if not exists locacao_dispositivo_sessoes_disp_idx
  on public.locacao_dispositivo_sessoes(dispositivo_id, created_at desc);

-- 3) Configuracao unica para a frota --------------------------------------
create table if not exists public.locacao_dispositivo_config (
  id integer primary key default 1 check (id = 1),
  minutos_cartao_15min integer not null default 15 check (minutos_cartao_15min between 1 and 60),
  minutos_cartao_5min integer not null default 5 check (minutos_cartao_5min between 1 and 60),
  firmware_versao_alvo text,      -- ex.: '2.0.1' (vazio = nao atualizar)
  firmware_url text,              -- link publico do .bin
  updated_at timestamptz not null default now()
);
insert into public.locacao_dispositivo_config (id) values (1) on conflict (id) do nothing;

-- 4) RLS: mesmo padrao do resto do banco (o carrinho NAO usa esse caminho) -
alter table public.locacao_dispositivos enable row level security;
alter table public.locacao_dispositivo_sessoes enable row level security;
alter table public.locacao_dispositivo_config enable row level security;
drop policy if exists "Acesso total para usuarios autenticados" on public.locacao_dispositivos;
drop policy if exists "Acesso total para usuarios autenticados" on public.locacao_dispositivo_sessoes;
drop policy if exists "Acesso total para usuarios autenticados" on public.locacao_dispositivo_config;
create policy "Acesso total para usuarios autenticados" on public.locacao_dispositivos
  for all to authenticated using (true) with check (true);
create policy "Acesso total para usuarios autenticados" on public.locacao_dispositivo_sessoes
  for all to authenticated using (true) with check (true);
create policy "Acesso total para usuarios autenticados" on public.locacao_dispositivo_config
  for all to authenticated using (true) with check (true);

-- 5) Funcoes chamadas pelo carrinho (unica porta de entrada do ESP32) ------
create or replace function public.dispositivo_heartbeat(
  p_device_token uuid,
  p_firmware_versao text,
  p_tensao_bateria numeric,
  p_horimetro_minutos integer,
  p_contador_15min integer,
  p_contador_5min integer,
  p_contador_livre integer,
  p_fila_pendente integer
) returns table (
  minutos_cartao_15min integer,
  minutos_cartao_5min integer,
  firmware_versao_alvo text,
  firmware_url text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.locacao_dispositivos d
  set firmware_versao   = p_firmware_versao,
      tensao_bateria    = p_tensao_bateria,
      horimetro_minutos = p_horimetro_minutos,
      contador_15min    = p_contador_15min,
      contador_5min     = p_contador_5min,
      contador_livre    = p_contador_livre,
      fila_pendente     = p_fila_pendente,
      ultima_conexao    = now(),
      updated_at        = now()
  where d.device_token = p_device_token;

  if not found then
    raise exception 'Dispositivo nao encontrado';
  end if;

  return query
    select c.minutos_cartao_15min, c.minutos_cartao_5min, c.firmware_versao_alvo, c.firmware_url
    from public.locacao_dispositivo_config c
    where c.id = 1;
end;
$$;

create or replace function public.dispositivo_registrar_sessao(
  p_device_token uuid,
  p_uid text,
  p_cartao_tipo text,
  p_iniciado_em timestamptz,
  p_finalizado_em timestamptz,
  p_minutos integer,
  p_minutos_liberados integer,
  p_motivo_termino text,
  p_quedas_energia integer
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
    (dispositivo_id, uid, cartao_tipo, iniciado_em, finalizado_em,
     minutos, minutos_liberados, motivo_termino, quedas_energia)
  values
    (v_dispositivo_id, p_uid, p_cartao_tipo, p_iniciado_em, p_finalizado_em,
     p_minutos, p_minutos_liberados, p_motivo_termino, p_quedas_energia)
  on conflict (uid) do nothing;     -- reenvio do mesmo aluguel nao duplica
end;
$$;

revoke all on function public.dispositivo_heartbeat(uuid, text, numeric, integer, integer, integer, integer, integer) from public;
revoke all on function public.dispositivo_registrar_sessao(uuid, text, text, timestamptz, timestamptz, integer, integer, text, integer) from public;
grant execute on function public.dispositivo_heartbeat(uuid, text, numeric, integer, integer, integer, integer, integer) to anon, authenticated;
grant execute on function public.dispositivo_registrar_sessao(uuid, text, text, timestamptz, timestamptz, integer, integer, text, integer) to anon, authenticated;

-- 6) Pasta publica para os arquivos de atualizacao (.bin) -----------------
insert into storage.buckets (id, name, public)
values ('firmware', 'firmware', true)
on conflict (id) do nothing;
