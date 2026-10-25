-- ========== Extensão por atraso: decisão de tempo movida pro banco ==========
-- A versão anterior (lib/locacao-atraso.ts) comparava
-- `data_prevista_devolucao + tolerância` contra `Date.now()` do processo
-- Node.js (Vercel) — um aluguel com tolerância de 4h chegou a ser estendido
-- (devolução empurrada 1 dia, diária extra cobrada) só 3h25 depois do
-- vencimento, ~35min ANTES da tolerância configurada vencer de verdade.
-- Não foi possível provar a causa exata sem logs de execução, mas comparar
-- dois relógios diferentes (o do processo Node e o do Postgres) pra decidir
-- algo que tem efeito financeiro real é uma classe de bug evitável: a função
-- abaixo faz a decisão inteira dentro do Postgres, usando now() do próprio
-- banco como única fonte de verdade — elimina qualquer desvio de relógio
-- entre app e banco como causa possível.
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
  v_novo_valor numeric;
  v_total_pago numeric;
  v_status text;
begin
  select extensao_atraso_ativo, extensao_atraso_horas into v_ativo, v_tolerancia_horas
  from locacao_config where id = 1;

  if not coalesce(v_ativo, false) then
    return;
  end if;

  -- "for update" trava cada linha processada: duas chamadas concorrentes
  -- (cron + alguém abrindo uma página ao mesmo tempo) nunca somam a mesma
  -- diária duas vezes, porque a segunda espera a primeira liberar a linha e
  -- então recalcula a partir do valor já atualizado.
  for r in
    select a.id, a.valor, a.data_prevista_devolucao, a.diarias_extras_atraso, v.valor_diaria
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

    v_novo_valor := r.valor + r.valor_diaria * v_dias_adicionados;

    select coalesce(sum(valor), 0) into v_total_pago
    from locacao_aluguel_pagamentos where aluguel_id = r.id;

    v_status := case
      when v_total_pago >= v_novo_valor - 0.001 then 'pago'
      when v_total_pago > 0 then 'parcial'
      else 'pendente'
    end;

    update locacao_alugueis
    set data_prevista_devolucao = v_nova_prevista,
        valor = v_novo_valor,
        diarias_extras_atraso = r.diarias_extras_atraso + v_dias_adicionados,
        status_pagamento = v_status,
        updated_at = now()
    where id = r.id;
  end loop;
end;
$$;

grant execute on function public.processar_extensao_alugueis_atrasados() to authenticated, service_role;
