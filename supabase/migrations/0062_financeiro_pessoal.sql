-- Financeiro Pessoal: controle particular do dono (contas da casa, cartões
-- pessoais), totalmente separado dos números da oficina e da locação —
-- mesmo padrão de "segunda empresa" já usado pra locacao_*, mas aqui nem é
-- uma empresa, é o controle pessoal mesmo. Substitui a planilha
-- "CONTAS_DA_CASA" (uma aba por mês) por um mês navegável, calculado a
-- partir de lançamentos normalizados em vez de 12 abas quase-duplicadas.

-- Renda do mês: salários e valores recebidos de terceiros. "previsto" é o
-- que se espera receber; "real" só é preenchido quando o valor realmente
-- cai na conta (mesma lógica previsto/real da planilha).
create table public.pessoal_renda (
  id uuid primary key default gen_random_uuid(),
  mes date not null,
  descricao text not null,
  categoria text not null default 'outro' check (categoria in ('salario_lucas', 'salario_jessica', 'terceiros', 'outro')),
  valor_previsto numeric not null default 0,
  valor_real numeric,
  created_at timestamptz not null default now(),
  deletado_em timestamptz
);

-- Itens do mês: contas fixas, carro, dízimo e contas extras — na planilha
-- são 4 blocos separados, mas têm exatamente a mesma forma (descrição,
-- previsto, real), então viram uma tabela só, distinguida por `secao`.
-- `valor_real` fica em branco até o usuário confirmar — é esse o "já sei
-- o valor, vou lá e confirmo" que o dono pediu.
create table public.pessoal_itens_mes (
  id uuid primary key default gen_random_uuid(),
  mes date not null,
  secao text not null check (secao in ('fixa', 'carro', 'dizimo', 'extra')),
  descricao text not null,
  forma_pagamento text,
  valor_previsto numeric not null default 0,
  valor_real numeric,
  pago_em date,
  created_at timestamptz not null default now(),
  deletado_em timestamptz
);

-- Cartões de crédito pessoais (um cadastro fixo, não por mês).
create table public.pessoal_cartoes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- Lançamentos de cada cartão, por mês e categoria. Uma compra parcelada
-- (ex: "3/6") gera uma linha por mês, todas compartilhando `compra_id` —
-- permite mostrar "3/6" e também apagar as parcelas futuras de uma compra
-- lançada errada de uma vez só. `valor_real` confirma o valor da fatura
-- quando ela é paga (igual aos itens do mês).
create table public.pessoal_cartao_lancamentos (
  id uuid primary key default gen_random_uuid(),
  cartao_id uuid not null references public.pessoal_cartoes(id) on delete cascade,
  compra_id uuid not null default gen_random_uuid(),
  mes date not null,
  categoria text not null check (
    categoria in ('alimentacao', 'carro', 'casa', 'celular', 'farmacia', 'feira', 'lanches', 'loja', 'oficina', 'igreja', 'outra_pessoa', 'outros')
  ),
  descricao text not null,
  parcela_atual integer not null default 1,
  parcela_total integer not null default 1,
  valor_previsto numeric not null default 0,
  valor_real numeric,
  created_at timestamptz not null default now(),
  deletado_em timestamptz
);

create index pessoal_renda_mes_idx on public.pessoal_renda (mes);
create index pessoal_itens_mes_mes_idx on public.pessoal_itens_mes (mes);
create index pessoal_cartao_lancamentos_mes_idx on public.pessoal_cartao_lancamentos (mes);
create index pessoal_cartao_lancamentos_compra_idx on public.pessoal_cartao_lancamentos (compra_id);

alter table public.pessoal_renda enable row level security;
create policy "Acesso total para usuarios autenticados" on public.pessoal_renda for all to authenticated using (true) with check (true);

alter table public.pessoal_itens_mes enable row level security;
create policy "Acesso total para usuarios autenticados" on public.pessoal_itens_mes for all to authenticated using (true) with check (true);

alter table public.pessoal_cartoes enable row level security;
create policy "Acesso total para usuarios autenticados" on public.pessoal_cartoes for all to authenticated using (true) with check (true);

alter table public.pessoal_cartao_lancamentos enable row level security;
create policy "Acesso total para usuarios autenticados" on public.pessoal_cartao_lancamentos for all to authenticated using (true) with check (true);
