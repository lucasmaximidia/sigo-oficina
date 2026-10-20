-- ========== ÍCONES DE VEÍCULOS (Storage + tabela) ==========
-- Substitui a ideia de "foto do veículo" (0042) por uma pequena biblioteca
-- de ícones ilustrativos, no mesmo estilo visual (mesmo fundo, mesma
-- paleta), que o usuário pode ampliar sozinho pela aba Ícones em
-- /locacao/icones, sem depender de fotos de produto com fundo padronizado.
insert into storage.buckets (id, name, public)
values ('locacao-icones', 'locacao-icones', true)
on conflict (id) do nothing;

create policy "Leitura publica de icones de locacao"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'locacao-icones');

create policy "Upload de icones de locacao"
on storage.objects for insert
to authenticated
with check (bucket_id = 'locacao-icones');

create policy "Atualizacao de icones de locacao"
on storage.objects for update
to authenticated
using (bucket_id = 'locacao-icones')
with check (bucket_id = 'locacao-icones');

create policy "Remocao de icones de locacao"
on storage.objects for delete
to authenticated
using (bucket_id = 'locacao-icones');

create table public.locacao_icones (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  arquivo_url text not null,
  created_at timestamptz not null default now()
);

alter table public.locacao_icones enable row level security;
create policy "Acesso total para usuarios autenticados" on public.locacao_icones
  for all to authenticated using (true) with check (true);

-- Ícones padrão, que já vêm com o app (public/locacao/icones) — o usuário
-- pode adicionar outros pela tela, que ficam guardados no Storage.
insert into public.locacao_icones (nome, arquivo_url) values
  ('Scooter', '/locacao/icones/scooter.svg'),
  ('Bicicleta', '/locacao/icones/bicicleta.svg'),
  ('Quadriciclo', '/locacao/icones/quadriciclo.svg');

-- Veículos cadastrados passam a usar o ícone do próprio tipo por padrão,
-- no lugar da foto real que tinham (0042/0167).
update public.locacao_veiculos set foto_url = '/locacao/icones/scooter.svg' where tipo = 'scooter';
update public.locacao_veiculos set foto_url = '/locacao/icones/bicicleta.svg' where tipo = 'bicicleta';
