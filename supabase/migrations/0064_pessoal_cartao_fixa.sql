-- Lançamentos de cartão que se repetem todo mês (assinatura, seguro,
-- mensalidade) — marcados como "conta fixa", em vez de parcela com número
-- fixo de meses. "Copiar do mês anterior" passa a trazer esses junto com as
-- contas fixas/carro/dízimo.
alter table public.pessoal_cartao_lancamentos
  add column eh_fixa boolean not null default false;
