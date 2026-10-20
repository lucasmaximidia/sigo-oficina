-- Entradas de caixa fora dos aluguéis (vendas avulsas, caução/depósito,
-- reembolso, outros) — mesmo padrão de locacao_despesas, só que do lado das
-- entradas. Espelha a aba "OUTRAS ENTRADAS" da planilha de controle de
-- caixa original.
create table public.locacao_outras_entradas (
  id uuid primary key default gen_random_uuid(),
  data date not null default current_date,
  descricao text not null,
  categoria text,
  forma_pagamento text check (forma_pagamento in ('pix', 'cartao', 'dinheiro', 'transferencia')),
  valor numeric(10,2) not null default 0,
  observacoes text,
  created_at timestamptz not null default now()
);

alter table public.locacao_outras_entradas enable row level security;
create policy "Acesso total para usuarios autenticados" on public.locacao_outras_entradas
  for all to authenticated using (true) with check (true);
