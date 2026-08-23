-- Card de lembrete (lista, não só contagem) dos boletos pendentes/vencendo no dashboard.
alter table public.configuracoes
  add column dashboard_mostrar_boletos_pendentes boolean not null default true;
