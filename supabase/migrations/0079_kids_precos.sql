-- =====================================================================
--  VoltCity KIDS - parte 2: tabela de precos
--  Lista editavel (varias linhas, como as redes Wi-Fi dos carrinhos),
--  nao uma linha unica de config.
-- =====================================================================

create table if not exists public.kids_precos (
  id uuid primary key default gen_random_uuid(),
  tempo_min integer not null check (tempo_min > 0),
  valor numeric(10,2) not null check (valor >= 0),
  ativo boolean not null default true,
  ordem integer not null default 0,
  updated_at timestamptz not null default now()
);

comment on table public.kids_precos is 'Precos dos tempos vendidos na praca (VoltCity KIDS). O valor cobrado nunca vem do cliente -- a Server Action busca aqui.';

insert into public.kids_precos (tempo_min, valor, ordem) values
  (5, 10.00, 1),
  (15, 25.00, 2)
on conflict do nothing;

alter table public.kids_precos enable row level security;

drop policy if exists "Admin gerencia precos kids" on public.kids_precos;
create policy "Admin gerencia precos kids"
  on public.kids_precos for all
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin' and p.ativo))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin' and p.ativo));

drop policy if exists "Operador le precos ativos" on public.kids_precos;
create policy "Operador le precos ativos"
  on public.kids_precos for select
  to authenticated
  using (ativo = true);
