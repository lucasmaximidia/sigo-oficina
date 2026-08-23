-- Permite cadastrar uma conta a pagar já dividida em parcelas mensais
-- (mesmo valor por parcela, vencimentos espaçados em 1 mês). Nulo em
-- ambas as colunas significa conta avulsa (sem parcelamento).
alter table public.financeiro_contas
  add column parcela_atual integer,
  add column parcela_total integer;
