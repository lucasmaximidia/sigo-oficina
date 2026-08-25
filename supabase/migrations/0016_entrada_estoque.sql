-- Entrada de Estoque: registra a NF de uma compra de mercadoria (loja
-- parceira, datas, valor total), os itens recebidos (que atualizam a
-- quantidade das peças em estoque) e gera automaticamente as contas a
-- pagar (boletos) já vinculadas àquela NF, parceladas quando necessário.

create table public.entradas_estoque (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid references public.lojas_parceiras(id) on delete set null,
  numero_nf text,
  data_nf date not null,
  data_chegada date,
  valor_total numeric(10,2) not null default 0,
  observacoes text,
  created_at timestamptz not null default now()
);

create table public.entrada_estoque_itens (
  id uuid primary key default gen_random_uuid(),
  entrada_id uuid not null references public.entradas_estoque(id) on delete cascade,
  peca_id uuid references public.pecas(id) on delete set null,
  quantidade integer not null default 1,
  valor_unitario numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);
create index entrada_estoque_itens_entrada_id_idx on public.entrada_estoque_itens(entrada_id);

alter table public.financeiro_contas
  add column entrada_estoque_id uuid references public.entradas_estoque(id) on delete set null;
