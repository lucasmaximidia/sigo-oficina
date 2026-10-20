-- Saldo em caixa real da Locação (não só "saldo do mês"): um ponto de
-- partida (saldo inicial + data de início) a partir do qual entradas e
-- saídas são somadas, mais uma tabela de ajustes manuais pra bater com o
-- dinheiro contado na mão — mesmo modelo da planilha de controle de caixa
-- original (aba "AJUSTE DO CAIXA").

create table public.locacao_config (
  id smallint primary key default 1,
  saldo_inicial numeric(10,2) not null default 0,
  data_inicio_caixa date,
  updated_at timestamptz not null default now(),
  constraint locacao_config_singleton check (id = 1)
);
insert into public.locacao_config (id) values (1);

create table public.locacao_ajustes_caixa (
  id uuid primary key default gen_random_uuid(),
  data date not null default current_date,
  motivo text not null,
  valor numeric(10,2) not null,
  created_at timestamptz not null default now()
);

do $$
declare
  tabela text;
begin
  foreach tabela in array array['locacao_config', 'locacao_ajustes_caixa']
  loop
    execute format('alter table public.%I enable row level security;', tabela);
    execute format(
      'create policy "Acesso total para usuarios autenticados" on public.%I for all to authenticated using (true) with check (true);',
      tabela
    );
  end loop;
end $$;
