-- Marca que a fatura do cartão (o total do mês, pago pra administradora)
-- foi quitada — diferente de confirmar o valor de cada lançamento
-- (pessoal_cartao_lancamentos.valor_real), que só confirma que a compra
-- bateu com o previsto. Uma linha por cartão/mês; cartões vencem em dias
-- diferentes, por isso o controle é por cartão, não um só pro mês todo.
create table public.pessoal_cartao_faturas (
  id uuid primary key default gen_random_uuid(),
  cartao_id uuid not null references public.pessoal_cartoes(id) on delete cascade,
  mes date not null,
  pago_em date not null,
  created_at timestamptz not null default now(),
  unique (cartao_id, mes)
);

alter table public.pessoal_cartao_faturas enable row level security;
create policy "Acesso total para usuarios autenticados" on public.pessoal_cartao_faturas for all to authenticated using (true) with check (true);
