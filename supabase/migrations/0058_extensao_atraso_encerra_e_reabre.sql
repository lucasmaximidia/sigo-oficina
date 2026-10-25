-- ========== Extensão por atraso: encerra o aluguel e abre um novo ==========
-- A versão anterior (migration 0057) empurrava a própria
-- data_prevista_devolucao pra frente e somava a diária extra no mesmo
-- aluguel — o que deixava a tela confusa: o card mostrava "Faltam Xh pra
-- devolver" (em relação à nova data) ao lado de "+1 diária (atraso)", e dava
-- a entender que a data nova empurrada era a combinada original.
--
-- Esta versão, em vez de inflar o mesmo registro, encerra o aluguel atual na
-- data combinada original (como se tivesse sido devolvido ali — o período
-- contratado terminou, mesmo que o veículo só volte fisicamente depois) e
-- abre um aluguel novo, mesmo cliente e veículo, cobrindo só o período em
-- atraso. O veículo nunca sai de "alugado" nessa transição (não tem
-- handoff físico de verdade). Cada atraso fica visível como um cartão
-- próprio em /locacao/alugueis, em vez de um contador que só cresce dentro
-- do mesmo aluguel.
create or replace function public.processar_extensao_alugueis_atrasados()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ativo boolean;
  v_tolerancia_horas smallint;
  r record;
  v_nova_prevista timestamptz;
  v_dias_adicionados integer;
  v_valor_extensao numeric;
  v_total_pago numeric;
  v_status text;
begin
  select extensao_atraso_ativo, extensao_atraso_horas into v_ativo, v_tolerancia_horas
  from locacao_config where id = 1;

  if not coalesce(v_ativo, false) then
    return;
  end if;

  for r in
    select a.id, a.numero, a.veiculo_id, a.cliente_id, a.valor, a.data_prevista_devolucao, a.forma_pagamento,
           v.valor_diaria
    from locacao_alugueis a
    join locacao_veiculos v on v.id = a.veiculo_id
    where a.data_devolucao_real is null
      and v.valor_diaria is not null
    for update of a
  loop
    v_nova_prevista := r.data_prevista_devolucao;
    v_dias_adicionados := 0;
    while v_nova_prevista + make_interval(hours => v_tolerancia_horas) <= now() loop
      v_nova_prevista := v_nova_prevista + interval '1 day';
      v_dias_adicionados := v_dias_adicionados + 1;
    end loop;

    if v_dias_adicionados = 0 then
      continue;
    end if;

    select coalesce(sum(valor), 0) into v_total_pago
    from locacao_aluguel_pagamentos where aluguel_id = r.id;

    v_status := case
      when v_total_pago >= r.valor - 0.001 then 'pago'
      when v_total_pago > 0 then 'parcial'
      else 'pendente'
    end;

    update locacao_alugueis
    set data_devolucao_real = r.data_prevista_devolucao,
        status_pagamento = v_status,
        updated_at = now()
    where id = r.id;

    v_valor_extensao := r.valor_diaria * v_dias_adicionados;

    insert into locacao_alugueis (
      veiculo_id, cliente_id, data_retirada, data_prevista_devolucao,
      valor, forma_pagamento, status_pagamento, valor_pago, data_pagamento,
      diarias_extras_atraso, observacoes
    ) values (
      r.veiculo_id, r.cliente_id, r.data_prevista_devolucao, v_nova_prevista,
      v_valor_extensao, r.forma_pagamento, 'pendente', 0, null,
      v_dias_adicionados, 'Continuação automática do aluguel #' || r.numero || ' por atraso na devolução'
    );
  end loop;
end;
$$;

grant execute on function public.processar_extensao_alugueis_atrasados() to authenticated, service_role;
