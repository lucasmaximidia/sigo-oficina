-- Permite excluir uma OS mesmo que exista um evento de agenda vinculado a ela
-- (o evento continua existindo, só perde o vínculo).
alter table public.agenda_eventos drop constraint agenda_eventos_os_id_fkey;
alter table public.agenda_eventos add constraint agenda_eventos_os_id_fkey
  foreign key (os_id) references public.ordens_servico(id) on delete set null;

-- Data e forma de pagamento passam a ser registradas separadamente da
-- finalização da OS; data de retirada marca quando o cliente pegou o
-- equipamento (é a partir dela que a garantia conta); e valor bruto/líquido
-- registram o desconto da maquininha em pagamentos com cartão.
alter table public.ordens_servico add column data_pagamento date;
alter table public.ordens_servico add column data_retirada date;
alter table public.ordens_servico add column tipo_cartao text check (tipo_cartao in ('debito','credito'));
alter table public.ordens_servico add column valor_pago_bruto numeric(10,2);
alter table public.ordens_servico add column valor_recebido_liquido numeric(10,2);

-- A garantia agora conta a partir da retirada do equipamento; enquanto a OS
-- finalizada não tiver data de retirada informada, cai de volta na data de
-- finalização (comportamento anterior).
drop view public.vw_garantias;
create view public.vw_garantias
with (security_invoker = true) as
select
  os.id as os_id,
  os.numero,
  os.cliente_id,
  c.nome as cliente_nome,
  os.equipamento_id,
  e.tipo as equipamento_tipo,
  e.marca as equipamento_marca,
  os.data_finalizacao,
  coalesce(os.data_retirada::timestamptz, os.data_finalizacao) as data_inicio_garantia,
  os.garantia_dias,
  (coalesce(os.data_retirada::timestamptz, os.data_finalizacao) + (os.garantia_dias || ' days')::interval) as data_expiracao,
  greatest(
    0,
    ceil(extract(epoch from ((coalesce(os.data_retirada::timestamptz, os.data_finalizacao) + (os.garantia_dias || ' days')::interval) - now())) / 86400)
  )::integer as dias_restantes,
  case
    when os.data_finalizacao is null then 'sem_garantia'
    when now() > (coalesce(os.data_retirada::timestamptz, os.data_finalizacao) + (os.garantia_dias || ' days')::interval) then 'expirada'
    when (coalesce(os.data_retirada::timestamptz, os.data_finalizacao) + (os.garantia_dias || ' days')::interval) - now() <= interval '15 days' then 'critica'
    else 'ativa'
  end as status_garantia
from public.ordens_servico os
join public.clientes c on c.id = os.cliente_id
left join public.equipamentos e on e.id = os.equipamento_id
where os.status = 'finalizado' and os.data_finalizacao is not null;
