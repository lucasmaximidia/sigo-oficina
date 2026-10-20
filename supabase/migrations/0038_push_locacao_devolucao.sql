-- Mesmo padrão de push_agenda_hoje_ativo: interruptor próprio pro aviso de
-- devoluções de locação do dia (VoltCity).
alter table public.configuracoes
  add column push_locacao_devolucao_ativo boolean not null default true;
