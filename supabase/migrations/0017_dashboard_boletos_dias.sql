-- Torna configurável a janela de "vencendo em breve" do lembrete de boletos
-- pendentes no dashboard (antes fixa em 3 dias).
alter table public.configuracoes
  add column dashboard_boletos_dias integer not null default 3;
