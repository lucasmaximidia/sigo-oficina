-- Conta quantas diárias extras já foram lançadas automaticamente por atraso
-- nesse aluguel (ver lib/locacao-atraso.ts) — só pra exibir um aviso visual
-- no card/lista, já que o valor sozinho não deixa óbvio o motivo do aumento.
alter table public.locacao_alugueis
  add column diarias_extras_atraso smallint not null default 0;

-- Configuração da extensão automática por atraso: liga/desliga e tolerância
-- em horas antes de lançar a diária extra (antes era fixo em 12h no código).
alter table public.locacao_config
  add column extensao_atraso_ativo boolean not null default true,
  add column extensao_atraso_horas smallint not null default 12;
