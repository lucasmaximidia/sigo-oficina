-- ========== Rate limit na consulta pública de garantia por telefone ==========
-- /garantias/consultar é uma página pública, sem login, que aceita qualquer
-- telefone via GET e devolve equipamento, data de finalização e status de
-- garantia de quem usou aquele número — sem nenhum limite, um script
-- poderia varrer sequências de telefone (DDD + 9 dígitos é um espaço
-- pequeno o bastante pra força bruta) e coletar dados de clientes em massa.
-- Esta função registra uma tentativa por IP e recusa quando o mesmo IP já
-- tentou demais na janela de tempo, sem expor a tabela de tentativas pra
-- fora (só a função, com security definer, acessa).
create table public.consulta_garantia_tentativas (
  id bigint generated always as identity primary key,
  ip text not null,
  criado_em timestamptz not null default now()
);

create index idx_consulta_garantia_tentativas_ip_criado_em
  on public.consulta_garantia_tentativas (ip, criado_em);

alter table public.consulta_garantia_tentativas enable row level security;

create or replace function public.registrar_tentativa_consulta_garantia(p_ip text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limite constant integer := 10;
  v_janela constant interval := interval '10 minutes';
  v_contagem integer;
begin
  delete from consulta_garantia_tentativas where criado_em < now() - v_janela;

  select count(*) into v_contagem
  from consulta_garantia_tentativas
  where ip = p_ip and criado_em > now() - v_janela;

  if v_contagem >= v_limite then
    return false;
  end if;

  insert into consulta_garantia_tentativas (ip) values (p_ip);
  return true;
end;
$$;

grant execute on function public.registrar_tentativa_consulta_garantia(text) to anon, authenticated;
