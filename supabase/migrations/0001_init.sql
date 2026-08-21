-- SIGO Oficina - schema inicial
-- Executar no SQL Editor do projeto Supabase (ou via `supabase db push`).
-- RLS fica desabilitado nesta v1 (acesso interno, sem Auth). A estrutura
-- (uuid pk, FKs, timestamps) já está pronta para receber Auth + RLS depois,
-- bastando adicionar policies sem alterar o schema.

create extension if not exists "pgcrypto";

-- ========== CLIENTES ==========
create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  email text,
  cpf_cnpj text,
  endereco text,
  bairro text,
  cidade text,
  estado text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========== EQUIPAMENTOS ==========
create table public.equipamentos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  tipo text not null,
  marca text,
  modelo text,
  numero_serie text,
  created_at timestamptz not null default now()
);
create index equipamentos_cliente_id_idx on public.equipamentos(cliente_id);

-- ========== LOJAS PARCEIRAS (fornecedores de peças) ==========
create table public.lojas_parceiras (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  especialidade text,
  telefone text,
  tempo_entrega text,
  desconto_percentual numeric(5,2) default 0,
  principal boolean not null default false,
  created_at timestamptz not null default now()
);

-- ========== PEÇAS (estoque próprio) ==========
create table public.pecas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  codigo text,
  categoria text,
  quantidade integer not null default 0,
  quantidade_minima integer not null default 2,
  preco_unitario numeric(10,2) not null default 0,
  fornecedor_id uuid references public.lojas_parceiras(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index pecas_fornecedor_id_idx on public.pecas(fornecedor_id);

-- ========== ORDENS DE SERVIÇO ==========
create table public.ordens_servico (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity,
  cliente_id uuid not null references public.clientes(id),
  equipamento_id uuid references public.equipamentos(id),
  problema_relatado text,
  diagnostico text,
  status text not null default 'aguardando_orcamento'
    check (status in ('aguardando_orcamento','em_execucao','aguardando_pecas','aguardando_pagamento','finalizado','cancelado')),
  urgencia text not null default 'media' check (urgencia in ('baixa','media','alta')),
  origem text not null default 'balcao' check (origem in ('balcao','domicilio','frete')),
  valor_mao_obra numeric(10,2) not null default 0,
  valor_frete numeric(10,2) not null default 0,
  desconto numeric(10,2) not null default 0,
  forma_pagamento text check (forma_pagamento in ('dinheiro','pix','cartao') or forma_pagamento is null),
  data_entrada timestamptz not null default now(),
  data_finalizacao timestamptz,
  garantia_dias integer not null default 90,
  parada boolean not null default false,
  parada_motivo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ordens_servico_cliente_id_idx on public.ordens_servico(cliente_id);
create index ordens_servico_status_idx on public.ordens_servico(status);

-- ========== ITENS DA OS (peças/serviços usados) ==========
create table public.os_itens (
  id uuid primary key default gen_random_uuid(),
  os_id uuid not null references public.ordens_servico(id) on delete cascade,
  peca_id uuid references public.pecas(id) on delete set null,
  descricao text not null,
  origem text not null default 'estoque'
    check (origem in ('estoque','loja_parceira','compra_emergencial')),
  quantidade integer not null default 1,
  valor_unitario numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);
create index os_itens_os_id_idx on public.os_itens(os_id);

-- ========== PDV (vendas avulsas) ==========
create table public.vendas_pdv (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity,
  cliente_id uuid references public.clientes(id),
  cliente_nome_avulso text,
  forma_pagamento text not null default 'dinheiro' check (forma_pagamento in ('dinheiro','pix','cartao')),
  subtotal numeric(10,2) not null default 0,
  desconto numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.venda_itens (
  id uuid primary key default gen_random_uuid(),
  venda_id uuid not null references public.vendas_pdv(id) on delete cascade,
  peca_id uuid references public.pecas(id) on delete set null,
  descricao text not null,
  tipo text not null default 'peca' check (tipo in ('peca','servico')),
  quantidade integer not null default 1,
  valor_unitario numeric(10,2) not null default 0
);
create index venda_itens_venda_id_idx on public.venda_itens(venda_id);

-- ========== FINANCEIRO ==========
create table public.financeiro_contas (
  id uuid primary key default gen_random_uuid(),
  descricao text not null,
  categoria text,
  fornecedor text,
  numero_documento text,
  valor numeric(10,2) not null default 0,
  vencimento date not null,
  status text not null default 'pendente' check (status in ('pendente','pago','atrasado')),
  pago_em date,
  created_at timestamptz not null default now()
);

create table public.financeiro_despesas (
  id uuid primary key default gen_random_uuid(),
  descricao text not null,
  categoria text,
  valor numeric(10,2) not null default 0,
  data date not null default current_date,
  created_at timestamptz not null default now()
);

-- ========== AGENDA ==========
create table public.agenda_eventos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  tipo text not null default 'oficina' check (tipo in ('servico_domicilio','frete','visita','oficina')),
  cliente_id uuid references public.clientes(id),
  os_id uuid references public.ordens_servico(id),
  endereco text,
  data_hora_inicio timestamptz not null,
  data_hora_fim timestamptz,
  status text not null default 'agendado'
    check (status in ('agendado','confirmado','aguardando_cliente','concluido','cancelado')),
  tecnico text,
  observacoes text,
  created_at timestamptz not null default now()
);
create index agenda_eventos_data_idx on public.agenda_eventos(data_hora_inicio);

-- ========== TAREFAS (checklist "o que fazer hoje") ==========
create table public.tarefas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  concluida boolean not null default false,
  data date not null default current_date,
  created_at timestamptz not null default now()
);

-- ========== CONFIGURAÇÕES (linha única) ==========
create table public.configuracoes (
  id integer primary key default 1 check (id = 1),
  nome_empresa text not null default 'Minha Oficina',
  cnpj text,
  telefone text,
  endereco text,
  logo_url text,
  garantia_prazo_dias integer not null default 90,
  garantia_tipo_cobertura text not null default 'Garantia Total (Peças e Mão de Obra)',
  garantia_texto_padrao text,
  garantia_alerta_dias integer not null default 7,
  garantia_notificar_tecnicos boolean not null default true,
  garantia_sms_cliente boolean not null default false,
  garantia_logo_certificado_url text,
  garantia_assinatura_digital boolean not null default true,
  garantia_qrcode boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into public.configuracoes (id) values (1);

-- ========== VIEW: GARANTIAS ==========
create view public.vw_garantias
with (security_invoker = true) as
select
  os.id as os_id,
  os.numero,
  os.cliente_id,
  c.nome as cliente_nome,
  os.equipamento_id,
  e.tipo as equipamento_tipo,
  e.marca as equipamento_marca,
  os.data_finalizacao,
  os.garantia_dias,
  (os.data_finalizacao + (os.garantia_dias || ' days')::interval) as data_expiracao,
  greatest(
    0,
    ceil(extract(epoch from ((os.data_finalizacao + (os.garantia_dias || ' days')::interval) - now())) / 86400)
  )::integer as dias_restantes,
  case
    when os.data_finalizacao is null then 'sem_garantia'
    when now() > (os.data_finalizacao + (os.garantia_dias || ' days')::interval) then 'expirada'
    when (os.data_finalizacao + (os.garantia_dias || ' days')::interval) - now() <= interval '15 days' then 'critica'
    else 'ativa'
  end as status_garantia
from public.ordens_servico os
join public.clientes c on c.id = os.cliente_id
left join public.equipamentos e on e.id = os.equipamento_id
where os.status = 'finalizado' and os.data_finalizacao is not null;

-- ========== updated_at triggers ==========
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.clientes
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.pecas
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.ordens_servico
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.configuracoes
  for each row execute function public.set_updated_at();

-- ========== RLS: desabilitado nesta v1 (uso interno, sem Auth) ==========
-- Quando Auth for adicionado, habilitar RLS em cada tabela acima com
-- `alter table public.<tabela> enable row level security;` e criar as
-- policies apropriadas antes de expor a chave publishable no cliente.
