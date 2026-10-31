alter table public.financeiro_despesas
  add column cartao boolean not null default false,
  add column pago_em date;

alter table public.financeiro_retiradas
  drop constraint financeiro_retiradas_tipo_check,
  add constraint financeiro_retiradas_tipo_check
    check (tipo in ('mao_de_obra', 'pagamento_parceiro', 'fatura_cartao', 'outro'));
