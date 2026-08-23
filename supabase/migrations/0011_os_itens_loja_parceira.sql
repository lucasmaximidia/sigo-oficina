-- Permite registrar de qual loja parceira veio cada peça usada na OS
-- (antes só existia a origem genérica "loja_parceira", sem saber qual delas).
alter table public.os_itens add column loja_parceira_id uuid references public.lojas_parceiras(id) on delete set null;
create index os_itens_loja_parceira_id_idx on public.os_itens(loja_parceira_id);
