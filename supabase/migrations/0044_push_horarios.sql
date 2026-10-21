-- Horário configurável por tipo de aviso (antes fixo, só no horário do cron
-- em vercel.json) + antecedência pra devolução de locação (hoje só avisava
-- no dia) + controle de "já rodou hoje" pra poder disparar tanto pelo cron
-- quanto ao abrir o app (ver lib/notificacoes-diarias.ts) sem duplicar.
alter table public.configuracoes
  add column push_contas_vencer_horario time not null default '08:00',
  add column push_contas_vencer_ultimo_envio date,
  add column push_agenda_hoje_horario time not null default '08:00',
  add column push_agenda_hoje_ultimo_envio date,
  add column push_locacao_devolucao_horario time not null default '08:00',
  add column push_locacao_devolucao_dias integer not null default 0,
  add column push_locacao_devolucao_ultimo_envio date;
