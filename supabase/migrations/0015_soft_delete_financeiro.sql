-- Soft delete para os registros financeiros de maior risco de exclusão
-- acidental (conta a pagar, despesa, venda do PDV): em vez de apagar de
-- verdade, marca deletado_em e deixa de aparecer nas listagens normais,
-- mas fica recuperável pela Lixeira em Configurações.
alter table public.financeiro_contas add column deletado_em timestamptz;
alter table public.financeiro_despesas add column deletado_em timestamptz;
alter table public.vendas_pdv add column deletado_em timestamptz;
