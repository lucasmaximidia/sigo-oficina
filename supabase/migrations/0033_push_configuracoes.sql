-- Configuração das notificações push de contas a vencer: um interruptor
-- próprio (independente do sino/toast do app, que continua sempre ligado)
-- e quantos dias de antecedência avisar. Futuros tipos de notificação
-- push ganham suas próprias colunas aqui, seguindo o mesmo padrão.
alter table public.configuracoes
  add column push_contas_vencer_ativo boolean not null default true,
  add column push_contas_vencer_dias integer not null default 2;

-- Identificação amigável do dispositivo (derivada do user-agent do
-- navegador no momento em que a notificação foi ativada), pra listar as
-- assinaturas cadastradas em Configurações sem mostrar o endpoint cru.
alter table public.push_subscriptions
  add column user_agent text;
