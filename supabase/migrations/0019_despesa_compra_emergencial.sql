-- Compra emergencial: o dinheiro sai do caixa na hora da compra (antes
-- mesmo do cliente pagar a OS), então agora gera uma despesa automática
-- vinculada ao item. Se o item for removido da OS, a despesa some junto
-- (cascade) — consistente com a remoção de item já ser definitiva hoje.
alter table public.financeiro_despesas add column os_item_id uuid references public.os_itens(id) on delete cascade;
