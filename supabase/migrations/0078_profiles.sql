-- =====================================================================
--  VoltCity KIDS - parte 1: perfis e papel de usuario
--  Primeira vez que este app distingue usuarios por papel (ate aqui,
--  qualquer autenticado tinha acesso total a tudo). Default 'admin' pra
--  nao quebrar os logins existentes; so vira 'operador_kids' quando
--  criado explicitamente pela tela de Operadores.
-- =====================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'operador_kids')),
  nome text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Papel (admin | operador_kids) e estado de cada usuario autenticado.';

-- Cria o perfil automaticamente a cada novo login criado (ex.: auth.admin.createUser
-- na tela de Operadores) -- sem isso, um usuario novo ficaria sem linha em profiles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill dos usuarios ja existentes (hoje so o seu) como admin.
insert into public.profiles (id, role)
select id, 'admin' from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;

-- Cada usuario le (e atualiza o proprio nome, se quiser) só o proprio perfil.
-- Gestao de OUTROS perfis (criar operador, listar, ativar/desativar) passa
-- pelo cliente service-role no servidor, nao por RLS multiusuario.
drop policy if exists "Usuario le o proprio perfil" on public.profiles;
create policy "Usuario le o proprio perfil"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());
