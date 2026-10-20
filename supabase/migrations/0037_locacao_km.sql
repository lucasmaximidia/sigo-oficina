-- Rastreamento de KM dos veículos de locação: KM de início/fim por aluguel
-- (permite calcular quanto cada veículo rodou) e vínculo opcional de
-- veículo + KM nas despesas (pra saber a cada quantos km foi feita uma
-- manutenção). Tudo opcional — não quebra os aluguéis/despesas já
-- lançados sem essa informação.

alter table public.locacao_alugueis
  add column km_inicio integer,
  add column km_fim integer;

alter table public.locacao_despesas
  add column veiculo_id uuid references public.locacao_veiculos(id) on delete set null,
  add column km integer;

create index locacao_despesas_veiculo_id_idx on public.locacao_despesas(veiculo_id);
