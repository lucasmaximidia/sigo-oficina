-- Compra emergencial: até aqui, o valor lançado virava ao mesmo tempo o
-- custo (despesa) e o valor cobrado do cliente (item da OS) — sem espaço
-- pra repassar com margem. Agora guardamos o custo real separado;
-- valor_unitario continua sendo o valor repassado ao cliente, compondo o
-- total da OS normalmente. A margem aparece sozinha no Financeiro quando
-- o cliente pagar a OS, sem lançamento duplicado.
alter table public.os_itens add column custo_unitario numeric;
