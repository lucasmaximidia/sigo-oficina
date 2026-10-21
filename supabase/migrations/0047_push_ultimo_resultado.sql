-- Resultado do último disparo de cada tipo de aviso push — antes o envio
-- sempre "dava certo" aos olhos de quem chamava, mesmo quando todas as
-- tentativas de envio falhavam (ex.: chave VAPID errada). Guardar o
-- resultado real permite mostrar isso em Configurações, sem depender de
-- olhar log de servidor pra saber se está funcionando.
alter table public.configuracoes
  add column push_contas_vencer_ultimo_resultado text,
  add column push_agenda_hoje_ultimo_resultado text,
  add column push_locacao_devolucao_ultimo_resultado text;
