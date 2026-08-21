alter table public.configuracoes
  add column dashboard_mostrar_pdv_hoje boolean not null default true,
  add column dashboard_mostrar_fretes_pendentes boolean not null default true,
  add column dashboard_mostrar_garantias_vencendo boolean not null default true,
  add column dashboard_mostrar_orcamentos_pendentes boolean not null default true;
