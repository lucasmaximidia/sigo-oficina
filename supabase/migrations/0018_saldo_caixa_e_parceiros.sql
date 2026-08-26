-- Saldo em caixa: soma tudo que entra (OS pagas + vendas PDV) menos tudo
-- que sai (despesas, contas pagas, fretes pagos e retiradas). Também
-- rastreia o acerto de contas com parceiros que não emitem boleto/NF —
-- cada item de OS com origem "loja_parceira" fica pendente até o
-- pagamento a esse parceiro ser lançado.

alter table public.os_itens add column pago_em timestamptz;

create table public.financeiro_retiradas (
  id uuid primary key default gen_random_uuid(),
  tipo text not null default 'outro' check (tipo in ('mao_de_obra', 'pagamento_parceiro', 'outro')),
  descricao text not null,
  loja_parceira_id uuid references public.lojas_parceiras(id) on delete set null,
  valor numeric(10,2) not null default 0,
  data date not null default current_date,
  created_at timestamptz not null default now(),
  deletado_em timestamptz
);
create index financeiro_retiradas_loja_parceira_id_idx on public.financeiro_retiradas(loja_parceira_id);
