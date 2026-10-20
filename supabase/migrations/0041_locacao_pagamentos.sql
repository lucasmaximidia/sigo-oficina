-- Pagamentos parciais/múltiplos de um aluguel: antes só existia um único
-- "valor_pago" que o botão de "registrar pagamento" sobrescrevia inteiro de
-- uma vez, sempre marcando o aluguel como 100% pago mesmo quando o cliente
-- pagou só uma parte. Agora cada pagamento vira uma linha aqui — mesmo
-- padrão de os_pagamentos (pagamentos de OS). Os campos valor_pago/
-- status_pagamento/data_pagamento em locacao_alugueis continuam existindo
-- como um cache, recalculado a partir da soma destes pagamentos a cada
-- inserção/remoção — assim a lista de aluguéis, o saldo em caixa e os
-- relatórios continuam lendo só locacao_alugueis, sem precisar de join em
-- todo lugar.
create table public.locacao_aluguel_pagamentos (
  id uuid primary key default gen_random_uuid(),
  aluguel_id uuid not null references public.locacao_alugueis(id) on delete cascade,
  forma_pagamento text not null check (forma_pagamento in ('pix', 'cartao', 'dinheiro', 'transferencia')),
  valor numeric(10,2) not null default 0,
  data date not null default current_date,
  created_at timestamptz not null default now()
);
create index locacao_aluguel_pagamentos_aluguel_id_idx on public.locacao_aluguel_pagamentos(aluguel_id);

alter table public.locacao_aluguel_pagamentos enable row level security;
create policy "Acesso total para usuarios autenticados" on public.locacao_aluguel_pagamentos
  for all to authenticated using (true) with check (true);

-- Carga única: todo aluguel que já tinha valor_pago > 0 precisa de uma
-- linha correspondente aqui, senão esse dinheiro desaparece das somas de
-- caixa/relatórios no momento em que elas passam a ler desta tabela em vez
-- de locacao_alugueis.valor_pago diretamente.
insert into public.locacao_aluguel_pagamentos (aluguel_id, forma_pagamento, valor, data)
select id, forma_pagamento, valor_pago, coalesce(data_pagamento, (data_retirada at time zone 'America/Sao_Paulo')::date)
from public.locacao_alugueis
where valor_pago > 0;
