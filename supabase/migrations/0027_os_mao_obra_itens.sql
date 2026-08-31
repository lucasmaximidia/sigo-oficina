-- Mão de obra descrita: lista opcional de serviços realizados numa OS, cada
-- um com descrição e valor. Quando usada, o total soma direto no campo
-- ordens_servico.valor_mao_obra (a fonte de verdade usada em todo o app),
-- então nenhum outro cálculo precisa saber que ela existe.
create table public.os_mao_obra_itens (
  id uuid primary key default gen_random_uuid(),
  os_id uuid not null references public.ordens_servico(id) on delete cascade,
  descricao text not null,
  valor numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create index os_mao_obra_itens_os_id_idx on public.os_mao_obra_itens(os_id);
