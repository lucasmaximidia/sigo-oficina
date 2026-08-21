-- Separa o preço único da peça em preço de custo (o que paga ao fornecedor)
-- e preço de venda (o que cobra do cliente), para permitir calcular a
-- margem de lucro por peça nos relatórios de fim de mês.
alter table public.pecas rename column preco_unitario to preco_venda;
alter table public.pecas add column preco_custo numeric(10,2) not null default 0;
