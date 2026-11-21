-- =====================================================================
--  Carrinhos (ESP32) - parte 3: manutencao por horimetro e historico
--  de comandos remotos. Nao muda nomes/parametros das funcoes
--  dispositivo_* chamadas pelo firmware, so o corpo delas.
-- =====================================================================

-- 1) Intervalo de manutencao da frota + base por carrinho -------------------
alter table public.locacao_dispositivo_config
  add column if not exists horas_manutencao integer not null default 100
    check (horas_manutencao between 10 and 1000);

alter table public.locacao_dispositivos
  add column if not exists manutencao_horimetro_min integer not null default 0,
  add column if not exists manutencao_em timestamptz;

-- 2) Historico de comandos remotos (zerar contadores/tudo) ------------------
create table if not exists public.locacao_dispositivo_comandos (
  id bigint primary key,
  dispositivo_id uuid not null references public.locacao_dispositivos(id) on delete cascade,
  comando text not null check (comando in ('zerar_contadores', 'zerar_tudo')),
  criado_em timestamptz not null default now(),
  executado_em timestamptz
);
create index if not exists locacao_dispositivo_comandos_disp_idx
  on public.locacao_dispositivo_comandos(dispositivo_id, criado_em desc);

alter table public.locacao_dispositivo_comandos enable row level security;
drop policy if exists "Acesso total para usuarios autenticados" on public.locacao_dispositivo_comandos;
create policy "Acesso total para usuarios autenticados" on public.locacao_dispositivo_comandos
  for all to authenticated using (true) with check (true);

-- 3) dispositivo_enviar_comando passa a registrar o historico (mesmo nome e
--    parametros - so o corpo muda) ------------------------------------------
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

  insert into public.locacao_dispositivo_comandos (id, dispositivo_id, comando)
  values (v_id, p_dispositivo_id, p_comando);

  return v_id;
end;
$$;

-- 4) dispositivo_heartbeat_v2 passa a marcar o historico quando o carrinho
--    confirma o comando (mesmo nome, parametros e retorno - so o corpo muda)
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

  if coalesce(p_comando_executado, 0) > 0 then
    update public.locacao_dispositivos d
    set comando_ultimo = d.comando,
        comando = null,
        comando_executado_em = now()
    where d.id = v_id and d.comando_id = p_comando_executado and d.comando is not null;

    update public.locacao_dispositivo_comandos
    set executado_em = now()
    where id = p_comando_executado and executado_em is null;
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
