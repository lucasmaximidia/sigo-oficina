-- Permite múltiplos fretes por OS (ex: Buscar + Entrega), cada um pago
-- independentemente. Remove o limite de 1 frete por OS e adiciona um tipo.

do $$
declare
  constraint_name text;
begin
  select conname into constraint_name
  from pg_constraint
  where conrelid = 'public.fretes'::regclass and contype = 'u';

  if constraint_name is not null then
    execute format('alter table public.fretes drop constraint %I', constraint_name);
  end if;
end $$;

alter table public.fretes
  add column tipo text not null default 'entrega' check (tipo in ('buscar', 'entrega'));
