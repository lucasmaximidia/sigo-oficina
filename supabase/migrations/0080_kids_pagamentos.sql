-- =====================================================================
--  VoltCity KIDS - parte 3: pagamentos
--  O operador so cria o pagamento (tempo + forma) -- o valor vem sempre
--  de kids_precos, nunca do formulario. Fase 1 so grava dinheiro e
--  maquininha (ja como 'pago'); os campos de Pix ficam prontos, mas sem
--  uso, ate a Fase 2. evento_id fica sem FK ate kids_eventos_carrinho
--  existir (Fase 3). Pedido de cancelamento fica pra depois -- por isso
--  o operador ainda nao tem policy de update/delete aqui.
-- =====================================================================

create table if not exists public.kids_pagamentos (
  id uuid primary key default gen_random_uuid(),
  operador_id uuid not null references auth.users(id),
  tempo_min integer not null,
  valor numeric(10,2) not null,
  forma_pagamento text not null check (forma_pagamento in ('pix', 'dinheiro', 'maquininha')),
  status text not null default 'aguardando' check (status in ('aguardando', 'pago', 'expirado', 'cancelamento_solicitado', 'cancelado')),
  pagamento_manual boolean not null default false,
  provedor_pagamento_id text,
  pix_copia_cola text,
  pix_qr_base64 text,
  pix_expira_em timestamptz,
  created_at timestamptz not null default now(),
  pago_em timestamptz,
  motivo_cancelamento text,
  evento_id uuid,
  updated_at timestamptz not null default now()
);

comment on table public.kids_pagamentos is 'Pagamentos da VoltCity KIDS. Vinculo com o uso real do carrinho (evento_id) e feito depois, pela conferencia por horario (Fase 3).';
comment on column public.kids_pagamentos.evento_id is 'Preenchido pela conferencia (Fase 3) -- sem FK ainda porque kids_eventos_carrinho nao existe nesta fase.';

create index if not exists kids_pagamentos_operador_id_idx on public.kids_pagamentos (operador_id);
create index if not exists kids_pagamentos_created_at_idx on public.kids_pagamentos (created_at);

alter table public.kids_pagamentos enable row level security;

drop policy if exists "Admin gerencia pagamentos kids" on public.kids_pagamentos;
create policy "Admin gerencia pagamentos kids"
  on public.kids_pagamentos for all
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin' and p.ativo))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin' and p.ativo));

drop policy if exists "Operador ve os proprios pagamentos" on public.kids_pagamentos;
create policy "Operador ve os proprios pagamentos"
  on public.kids_pagamentos for select
  to authenticated
  using (operador_id = auth.uid());

drop policy if exists "Operador insere os proprios pagamentos" on public.kids_pagamentos;
create policy "Operador insere os proprios pagamentos"
  on public.kids_pagamentos for insert
  to authenticated
  with check (
    operador_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('operador_kids', 'admin') and p.ativo
    )
  );
