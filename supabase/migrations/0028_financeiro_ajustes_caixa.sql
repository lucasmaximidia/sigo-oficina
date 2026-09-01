-- Ajuste de Caixa: lançamento manual (positivo ou negativo) usado para
-- reconciliar o saldo calculado pelo sistema com o caixa físico real —
-- por exemplo, o saldo que já existia antes de começar a usar o SIGO,
-- descoberto ao fechar o primeiro mês.
create table public.financeiro_ajustes_caixa (
  id uuid primary key default gen_random_uuid(),
  descricao text not null,
  valor numeric(10,2) not null default 0,
  data date not null default current_date,
  created_at timestamptz not null default now(),
  deletado_em timestamptz
);
