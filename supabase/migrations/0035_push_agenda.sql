-- Mesmo padrão de push_contas_vencer_ativo: interruptor próprio pro aviso
-- de agendamentos do dia, independente do sino/toast do app.
alter table public.configuracoes
  add column push_agenda_hoje_ativo boolean not null default true;
