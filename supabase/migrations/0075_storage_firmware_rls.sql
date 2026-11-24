-- A migration 0071 criou o bucket "firmware" mas esqueceu as policies de
-- storage.objects (RLS) para ele -- por isso todo upload vinha dando 400
-- (nenhuma policy de INSERT/UPDATE liberava o usuario autenticado). Mesmo
-- padrao ja usado pelos buckets logos/locacao-icones/notas-fiscais.
drop policy if exists "Upload de firmware" on storage.objects;
drop policy if exists "Atualizacao de firmware" on storage.objects;
drop policy if exists "Leitura de firmware" on storage.objects;

create policy "Upload de firmware" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'firmware');

create policy "Atualizacao de firmware" on storage.objects
  for update to authenticated
  using (bucket_id = 'firmware')
  with check (bucket_id = 'firmware');

create policy "Leitura de firmware" on storage.objects
  for select to authenticated
  using (bucket_id = 'firmware');
