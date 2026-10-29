-- ========== KM atual direto no cadastro do veículo ==========
-- Antes, o "KM atual" mostrado no card do veículo disponível era só
-- calculado (maior km_fim entre os aluguéis já encerrados) — não dava pra
-- corrigir ou atualizar manualmente (ex.: depois de uma manutenção que não
-- passou por um aluguel, ou pra corrigir um KM errado lançado antes).
-- Agora km_atual mora no próprio veículo, editável direto no cadastro, e
-- continua sendo atualizado automaticamente a cada devolução registrada
-- (ver lib/locacao-actions.ts).
alter table public.locacao_veiculos add column km_atual integer;

-- Backfill a partir do histórico já existente, pra não perder o que já
-- estava sendo calculado.
update public.locacao_veiculos v
set km_atual = sub.max_km
from (
  select veiculo_id, max(km_fim) as max_km
  from public.locacao_alugueis
  where km_fim is not null
  group by veiculo_id
) sub
where sub.veiculo_id = v.id;
