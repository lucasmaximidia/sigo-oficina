-- Balanço de estoque: sessões periódicas de contagem física, comparando com
-- a quantidade que o sistema tinha registrada e ajustando o estoque a partir
-- da contagem. Guarda histórico de cada balanço feito.

create table public.balancos_estoque (
  id uuid primary key default gen_random_uuid(),
  data date not null default current_date,
  observacao text,
  created_at timestamptz not null default now()
);

create table public.balanco_estoque_itens (
  id uuid primary key default gen_random_uuid(),
  balanco_id uuid not null references public.balancos_estoque(id) on delete cascade,
  peca_id uuid references public.pecas(id) on delete set null,
  peca_nome text not null,
  peca_codigo text,
  quantidade_sistema integer not null,
  quantidade_contada integer not null,
  diferenca integer not null,
  created_at timestamptz not null default now()
);

create index balanco_estoque_itens_balanco_id_idx on public.balanco_estoque_itens(balanco_id);
