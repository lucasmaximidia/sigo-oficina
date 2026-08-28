-- ========== EMPRESAS AUTORIZADAS (atendimento de assistência técnica autorizada) ==========
-- Ex: PRAXIS, IPC — mandam o defeito pra cá, a peça já vem delas (só cobramos mão de obra),
-- e o pagamento é acertado periodicamente em lote, não na hora como numa OS normal.
create table public.empresas_autorizadas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.ordens_servico
  add column empresa_autorizada_id uuid references public.empresas_autorizadas(id) on delete set null,
  add column numero_os_autorizada text,
  add column referencia_autorizada text,
  add column produto_autorizada text,
  add column numero_serie_autorizada text;
create index ordens_servico_empresa_autorizada_id_idx on public.ordens_servico(empresa_autorizada_id);

-- Novo método de pagamento usado só quando a conta com a autorizada é fechada em lote.
alter table public.ordens_servico drop constraint ordens_servico_forma_pagamento_check;
alter table public.ordens_servico add constraint ordens_servico_forma_pagamento_check
  check (forma_pagamento in ('dinheiro','pix','cartao','autorizada') or forma_pagamento is null);

alter table public.os_pagamentos drop constraint os_pagamentos_forma_pagamento_check;
alter table public.os_pagamentos add constraint os_pagamentos_forma_pagamento_check
  check (forma_pagamento in ('dinheiro','pix','cartao','autorizada'));
