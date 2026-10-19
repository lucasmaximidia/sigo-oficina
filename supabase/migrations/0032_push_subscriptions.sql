-- Assinaturas de push do navegador (Web Push), uma linha por dispositivo
-- autenticado que ativou as notificações. `endpoint` identifica o
-- dispositivo/navegador de forma única; `p256dh`/`auth` são as chaves
-- públicas da assinatura exigidas pelo protocolo Web Push para criptografar
-- a mensagem. O job que dispara as notificações (ex.: contas a vencer) lê
-- todas as linhas e envia para cada uma, removendo as que o navegador
-- recusar (assinatura expirada ou cancelada pelo usuário).
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;
create policy "Acesso total para usuarios autenticados" on public.push_subscriptions for all to authenticated using (true) with check (true);
