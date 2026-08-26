-- CNPJ opcional para identificar a loja parceira formalmente (ex: emissão
-- de NF, acerto de contas).
alter table public.lojas_parceiras add column cnpj text;
