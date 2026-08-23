-- Esses dois campos eram salvos mas nunca disparavam notificação nenhuma
-- (nenhum envio de SMS/e-mail/push estava implementado). Removidos pra não
-- dar a falsa impressão de que a funcionalidade existe.
alter table public.configuracoes
  drop column garantia_notificar_tecnicos,
  drop column garantia_sms_cliente;
