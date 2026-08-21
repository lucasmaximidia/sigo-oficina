-- ========== LOGO DA EMPRESA (Storage) ==========
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

create policy "Leitura publica de logos"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'logos');

create policy "Upload de logos"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'logos');

create policy "Atualizacao de logos"
on storage.objects for update
to anon, authenticated
using (bucket_id = 'logos')
with check (bucket_id = 'logos');

-- ========== ORÇAMENTOS ==========
create table public.orcamentos (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity,
  cliente_id uuid not null references public.clientes(id),
  descricao text,
  observacoes text,
  status text not null default 'rascunho'
    check (status in ('rascunho','enviado','aprovado','recusado','expirado')),
  desconto numeric(10,2) not null default 0,
  data_validade date not null default (current_date + interval '15 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orcamentos_cliente_id_idx on public.orcamentos(cliente_id);

create table public.orcamento_itens (
  id uuid primary key default gen_random_uuid(),
  orcamento_id uuid not null references public.orcamentos(id) on delete cascade,
  descricao text not null,
  tipo text not null default 'peca' check (tipo in ('peca','mao_obra')),
  quantidade integer not null default 1,
  valor_unitario numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);
create index orcamento_itens_orcamento_id_idx on public.orcamento_itens(orcamento_id);

create trigger set_updated_at before update on public.orcamentos
  for each row execute function public.set_updated_at();
