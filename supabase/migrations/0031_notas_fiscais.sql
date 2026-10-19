-- Emissão de NFS-e (nota fiscal de serviço eletrônica), via gateway
-- terceirizado (inicialmente a Notaas). Cartão/PIX tornam a nota
-- obrigatória por lei; em dinheiro o cliente decide.
create table public.notas_fiscais (
  id uuid primary key default gen_random_uuid(),
  origem text not null check (origem in ('os', 'venda_pdv', 'avulsa')),
  os_id uuid references public.ordens_servico(id) on delete cascade,
  venda_id uuid references public.vendas_pdv(id) on delete cascade,
  cliente_id uuid references public.clientes(id) on delete set null,
  cliente_nome text not null,
  cliente_documento text,
  descricao_servico text not null,
  valor numeric(10,2) not null check (valor > 0),
  motivo text not null check (motivo in ('obrigatoria_cartao_pix', 'opcional_cliente_sim', 'opcional_cliente_nao')),
  status text not null default 'pendente' check (status in ('pendente', 'emitida', 'erro', 'cancelada', 'nao_emitir')),
  provider text not null default 'notaas',
  provider_id text,
  numero_nfse text,
  codigo_verificacao text,
  url_pdf text,
  url_xml text,
  erro_mensagem text,
  created_at timestamptz not null default now(),
  emitida_em timestamptz,
  -- Uma OS/venda só precisa de uma nota ativa por vez (criamos uma nova
  -- linha só se a anterior for cancelada).
  constraint notas_fiscais_origem_referencia check (
    (origem = 'os' and os_id is not null and venda_id is null) or
    (origem = 'venda_pdv' and venda_id is not null and os_id is null) or
    (origem = 'avulsa' and os_id is null and venda_id is null)
  )
);
create index notas_fiscais_os_id_idx on public.notas_fiscais(os_id);
create index notas_fiscais_venda_id_idx on public.notas_fiscais(venda_id);
create index notas_fiscais_status_idx on public.notas_fiscais(status);

alter table public.notas_fiscais enable row level security;
create policy "Acesso total para usuarios autenticados" on public.notas_fiscais
  for all to authenticated using (true) with check (true);

-- Configuração do emissor de NFS-e. O certificado digital e a chave de
-- API do gateway NÃO ficam aqui — a chave vem de variável de ambiente
-- (NOTAAS_API_KEY) e o certificado é cadastrado direto no painel do
-- gateway. Aqui só fica o que descreve o serviço prestado pra prefeitura.
alter table public.configuracoes
  add column nfse_ativo boolean not null default false,
  add column nfse_codigo_servico text,
  add column nfse_descricao_padrao text not null default 'Serviço de assistência técnica em eletrodomésticos.',
  add column nfse_aliquota_iss numeric(5,2);
