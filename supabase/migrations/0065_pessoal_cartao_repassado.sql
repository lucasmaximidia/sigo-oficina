-- Marca individualmente quando um gasto de cartão por conta de terceiros
-- (oficina/VoltCity/outra pessoa) já foi repassado de volta, em vez de só
-- um botão único pro total do mês inteiro.
alter table public.pessoal_cartao_lancamentos
  add column repassado_em timestamptz;
