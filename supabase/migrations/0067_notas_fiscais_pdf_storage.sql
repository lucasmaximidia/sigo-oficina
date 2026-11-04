-- Bucket pra guardar uma cópia permanente do PDF da NFS-e quando ela é
-- emitida (ver app/api/webhooks/notaas/route.ts) — não depender só do link
-- da Notaas, que pode mudar ou expirar. Público como os demais buckets de
-- arquivo do sistema (logos, ícones de locação): o caminho do arquivo já é
-- a chave de acesso, ninguém adivinha por fora.
insert into storage.buckets (id, name, public)
values ('notas-fiscais', 'notas-fiscais', true)
on conflict (id) do nothing;

create policy "Leitura pública de notas fiscais"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'notas-fiscais');

create policy "Upload de notas fiscais por usuários autenticados"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'notas-fiscais');

create policy "Atualização de notas fiscais por usuários autenticados"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'notas-fiscais');
