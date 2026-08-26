-- Pagamentos parciais/adiantados de OS: antes só existia um único
-- pagamento por OS, lançado junto com "Finalizar Ordem". Agora o cliente
-- pode pagar em partes (sinal antes de finalizar, resto depois), então
-- cada pagamento vira uma linha aqui. Os campos forma_pagamento/
-- data_pagamento/tipo_cartao/valor_pago_bruto/valor_recebido_liquido em
-- ordens_servico continuam existindo e são preenchidos automaticamente
-- quando a soma dos pagamentos quita o total da OS — isso mantém todo o
-- Financeiro (entradas, acerto com parceiros, relatórios) funcionando sem
-- mudança, já que eles só olham para "a OS está paga?" através desses
-- campos.
create table public.os_pagamentos (
  id uuid primary key default gen_random_uuid(),
  os_id uuid not null references public.ordens_servico(id) on delete cascade,
  forma_pagamento text not null check (forma_pagamento in ('dinheiro', 'pix', 'cartao')),
  tipo_cartao text check (tipo_cartao in ('debito', 'credito') or tipo_cartao is null),
  valor numeric(10,2) not null default 0,
  valor_recebido_liquido numeric(10,2),
  data date not null default current_date,
  created_at timestamptz not null default now()
);
create index os_pagamentos_os_id_idx on public.os_pagamentos(os_id);
