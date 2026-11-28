-- A policy "Usuario le o proprio perfil" só deixa cada usuário ler a própria
-- linha. O admin precisa listar/ver o nome de todos os operadores (tela
-- /locacao/kids) — esta policy adiciona esse acesso sem abrir pra qualquer
-- usuário. A subconsulta não recursiona de verdade: ela sempre filtra pela
-- própria linha de quem está logado (p.id = auth.uid()), que a policy de
-- "proprio perfil" já libera.
create policy "Admin le todos os perfis" on public.profiles for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin' and p.ativo));
