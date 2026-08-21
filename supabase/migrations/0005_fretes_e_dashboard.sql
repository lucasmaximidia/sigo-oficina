-- ========== FRETES (custo pago ao prestador, separado do valor cobrado do cliente) ==========
create table public.prestadores_frete (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  created_at timestamptz not null default now()
);

create table public.fretes (
  id uuid primary key default gen_random_uuid(),
  os_id uuid not null references public.ordens_servico(id) on delete cascade,
  prestador_id uuid references public.prestadores_frete(id) on delete set null,
  valor_custo numeric(10,2) not null default 0,
  status text not null default 'pendente' check (status in ('pendente', 'pago')),
  data_pagamento date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (os_id)
);
create index fretes_prestador_id_idx on public.fretes(prestador_id);

create trigger set_updated_at before update on public.fretes
  for each row execute function public.set_updated_at();

-- ========== DASHBOARD CONFIGURÁVEL ==========
alter table public.configuracoes
  add column dashboard_mostrar_stats boolean not null default true,
  add column dashboard_mostrar_agenda boolean not null default true,
  add column dashboard_mostrar_os_paradas boolean not null default true,
  add column dashboard_mostrar_tarefas boolean not null default true,
  add column dashboard_os_parada_dias integer not null default 3;
