-- Mesmo tratamento de taxa de maquininha que já existe em os_pagamentos:
-- valor é o que foi cobrado do cliente, valor_recebido_liquido é o que
-- efetivamente caiu no caixa depois do desconto da maquininha (só
-- preenchido quando forma_pagamento = 'cartao').
alter table public.venda_pagamentos
  add column tipo_cartao text check (tipo_cartao in ('debito', 'credito') or tipo_cartao is null),
  add column valor_recebido_liquido numeric(10,2);
