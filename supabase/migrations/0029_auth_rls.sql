-- Login (email/senha via Supabase Auth) + RLS.
-- Os 2 usuários da oficina têm o mesmo nível de acesso, então a regra é
-- simples: qualquer usuário autenticado tem acesso total a todas as
-- tabelas. O acesso direto ao banco com a chave anônima (sem login) deixa
-- de funcionar a partir daqui — exceto para o que é intencionalmente
-- público (ver `verificar_garantia` mais abaixo).
--
-- Os 2 usuários devem ser criados manualmente no painel do Supabase
-- (Authentication > Users > Add user), com "Auto Confirm User" marcado.

-- ========== RLS: authenticated tem acesso total ==========
do $$
declare
  tabela text;
begin
  foreach tabela in array array[
    'agenda_eventos', 'balanco_estoque_itens', 'balancos_estoque', 'clientes',
    'configuracoes', 'empresas_autorizadas', 'entrada_estoque_itens',
    'entradas_estoque', 'equipamentos', 'financeiro_ajustes_caixa',
    'financeiro_contas', 'financeiro_despesas', 'financeiro_retiradas',
    'fretes', 'lojas_parceiras', 'orcamento_itens', 'orcamentos',
    'ordens_servico', 'os_itens', 'os_mao_obra_itens', 'os_pagamentos',
    'pecas', 'prestadores_frete', 'tarefas', 'venda_itens',
    'venda_pagamentos', 'vendas_pdv'
  ]
  loop
    execute format('alter table public.%I enable row level security;', tabela);
    execute format(
      'create policy "Acesso total para usuarios autenticados" on public.%I for all to authenticated using (true) with check (true);',
      tabela
    );
  end loop;
end $$;

-- ========== Storage (logos): upload/edição passam a exigir login ==========
-- A leitura pública continua liberada (logo aparece em documentos impressos
-- e na página pública de verificação de garantia).
drop policy "Upload de logos" on storage.objects;
create policy "Upload de logos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'logos');

drop policy "Atualizacao de logos" on storage.objects;
create policy "Atualizacao de logos"
on storage.objects for update
to authenticated
using (bucket_id = 'logos')
with check (bucket_id = 'logos');

-- ========== Verificação pública de garantia (sem login) ==========
-- A tela /garantias/verificar/[id] é acessada pelo cliente via QR code no
-- certificado impresso, sem conta no sistema. Em vez de abrir uma policy de
-- leitura anônima em `ordens_servico`/`clientes` (exporia dados de todos os
-- clientes), a função abaixo roda com privilégio elevado (security definer)
-- e devolve só os campos necessários para essa tela, para o único `os_id`
-- pedido.
create or replace function public.verificar_garantia(p_os_id uuid)
returns table (
  numero integer,
  equipamento_tipo text,
  equipamento_marca text,
  data_finalizacao date,
  data_expiracao timestamptz,
  status_garantia text,
  nome_empresa text,
  logo_url text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    v.numero,
    v.equipamento_tipo,
    v.equipamento_marca,
    v.data_finalizacao,
    v.data_expiracao,
    v.status_garantia,
    cfg.nome_empresa,
    cfg.logo_url
  from public.vw_garantias v
  left join public.configuracoes cfg on cfg.id = 1
  where v.os_id = p_os_id;
$$;

grant execute on function public.verificar_garantia(uuid) to anon, authenticated;
