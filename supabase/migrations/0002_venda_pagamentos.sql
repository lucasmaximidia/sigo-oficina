-- Suporta pagamento dividido em mais de uma forma (ex: parte dinheiro, parte PIX) no PDV.
create table public.venda_pagamentos (
  id uuid primary key default gen_random_uuid(),
  venda_id uuid not null references public.vendas_pdv(id) on delete cascade,
  forma_pagamento text not null check (forma_pagamento in ('dinheiro','pix','cartao')),
  valor numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);
create index venda_pagamentos_venda_id_idx on public.venda_pagamentos(venda_id);
